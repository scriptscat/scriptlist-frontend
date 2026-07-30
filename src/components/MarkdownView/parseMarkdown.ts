import { marked } from 'marked';
import xss, {
  whiteList as defaultWhiteList,
  safeAttrValue as defaultSafeAttrValue,
} from 'xss';

// ---------------------------------------------------------------------------
// HTML sanitization allowlist.
//
// Union of GitHub's Markdown sanitization allowlist (html-pipeline
// SanitizationFilter) and js-xss's default allowlist: we gain GitHub's
// capabilities (<picture>, responsive <source>/<img>, <details>, <kbd>, …)
// without dropping anything that already renders here.
//
// GitHub's model = a set of elements + "global" attributes allowed on every
// element + a few element-specific attributes. js-xss has no global-attribute
// concept, so the global set is folded into every allowed tag at build time.
// ---------------------------------------------------------------------------

// GitHub-allowed elements (html-pipeline SanitizationFilter).
const GITHUB_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'br',
  'b',
  'i',
  'strong',
  'em',
  'a',
  'pre',
  'code',
  'img',
  'tt',
  'div',
  'ins',
  'del',
  'sup',
  'sub',
  'p',
  'picture',
  'ol',
  'ul',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'blockquote',
  'dl',
  'dt',
  'dd',
  'kbd',
  'q',
  'samp',
  'var',
  'hr',
  'ruby',
  'rt',
  'rp',
  'li',
  'tr',
  'td',
  'th',
  's',
  'strike',
  'summary',
  'details',
  'caption',
  'figure',
  'figcaption',
  'abbr',
  'bdo',
  'cite',
  'dfn',
  'mark',
  'small',
  'source',
  'span',
  'time',
  'wbr',
];

// Attributes GitHub permits on every element (note: `class`/`style` are NOT here).
const GLOBAL_ATTRS = [
  'abbr',
  'accept',
  'accept-charset',
  'accesskey',
  'action',
  'align',
  'alt',
  'aria-describedby',
  'aria-hidden',
  'aria-label',
  'aria-labelledby',
  'axis',
  'border',
  'char',
  'charoff',
  'charset',
  'checked',
  'clear',
  'cols',
  'colspan',
  'compact',
  'coords',
  'datetime',
  'dir',
  'disabled',
  'enctype',
  'for',
  'frame',
  'headers',
  'height',
  'hreflang',
  'hspace',
  'id',
  'ismap',
  'label',
  'lang',
  'maxlength',
  'media',
  'method',
  'multiple',
  'name',
  'nohref',
  'noshade',
  'nowrap',
  'open',
  'progress',
  'prompt',
  'readonly',
  'rel',
  'rev',
  'role',
  'rows',
  'rowspan',
  'rules',
  'scope',
  'selected',
  'shape',
  'size',
  'span',
  'start',
  'summary',
  'tabindex',
  'title',
  'type',
  'usemap',
  'valign',
  'value',
  'width',
  'itemprop',
];

// GitHub element-specific attributes.
const SPECIFIC_ATTRS: Record<string, string[]> = {
  a: ['href'],
  img: ['src', 'longdesc', 'loading', 'alt'],
  div: ['itemscope', 'itemtype'],
  blockquote: ['cite'],
  del: ['cite'],
  ins: ['cite'],
  q: ['cite'],
  source: ['srcset'],
};

// App-specific extensions (kept for existing functionality):
// - class on code/pre/span → Prism syntax highlighting
// - input (not in GitHub's base) → GFM task-list checkboxes
// - video + source[src] → in-site video embeds (GitHub disallows <video>)
const APP_TAGS = ['input', 'video'];
const APP_ATTRS: Record<string, string[]> = {
  code: ['class'],
  pre: ['class'],
  span: ['class'],
  input: ['type', 'checked', 'disabled'],
  video: ['src', 'controls', 'preload', 'poster'],
  source: ['src'],
};

// Build the union allowlist: preserve every current js-xss allowance
// (zero regression), then add GitHub's global + specific attributes and the
// app extensions. GLOBAL_ATTRS carry no `on*` handlers, so this stays safe.
const buildWhiteList = (): Record<string, string[]> => {
  const whiteList: Record<string, string[]> = {};
  const tags = new Set<string>(
    Object.keys(defaultWhiteList).concat(GITHUB_TAGS, APP_TAGS),
  );
  tags.forEach((tag) => {
    const attrs = new Set<string>(
      (defaultWhiteList[tag] || []).concat(
        GLOBAL_ATTRS,
        SPECIFIC_ATTRS[tag] || [],
        APP_ATTRS[tag] || [],
      ),
    );
    whiteList[tag] = Array.from(attrs);
  });
  return whiteList;
};

const xssWhiteList = buildWhiteList();

// <video> is an app extension, not part of GitHub's allowlist. Keep its
// deliberately narrow attribute surface instead of inheriting js-xss's
// defaults (autoplay/loop/muted/crossorigin) that the union would otherwise
// fold in — no auto-playing/looping embeds.
xssWhiteList.video = [
  'src',
  'controls',
  'width',
  'height',
  'preload',
  'poster',
];

// Match GitHub's handling of disallowed tags: unwrap unknown tags (drop the
// tag, keep its text) and remove these tags together with their contents.
const stripIgnoreTagBody = [
  'script',
  'style',
  'iframe',
  'noscript',
  'noframes',
  'noembed',
  'math',
  'svg',
  'plaintext',
  'xmp',
];

// ---------------------------------------------------------------------------
// Relative resource resolution.
//
// A script description synced from a remote README keeps that README's relative
// paths (`./assets/x.png`, `/assets/x.png`), which resolve to nothing here. Given
// the bases derived from the sync URL we rewrite them back to absolute URLs.
//
// This runs on sanitizer attributes rather than in the marked renderer on
// purpose: relative paths appear both in Markdown syntax (`![a](./x.png)`) and in
// raw HTML passed straight through (`<p align="center"><img src="./x.png">`), and
// only the attribute layer sees both. It also runs after Markdown parsing, so a
// `src="./x.png"` inside a fenced code block is already escaped text and is left
// alone.
// ---------------------------------------------------------------------------

export interface ResourceBase {
  /** Directory of the source document — resolves `./x`, `../x`, `x`. */
  base: string;
  /**
   * Repository + ref root — resolves `/x`. GitHub resolves root-relative README
   * paths against the repository root rather than the host root. Empty when the
   * root cannot be determined, in which case `/x` keeps standard URL semantics.
   */
  root?: string;
}

// Attributes carrying a single URL. `srcset` is a list and is left untouched.
const RESOLVE_ATTRS: Record<string, string[]> = {
  img: ['src'],
  a: ['href'],
  video: ['src', 'poster'],
  source: ['src'],
};

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

const withTrailingSlash = (url: string) =>
  url.endsWith('/') ? url : url + '/';

const absolutizeUrl = (value: string, resourceBase: ResourceBase): string => {
  if (
    !value ||
    HAS_SCHEME.test(value) || // already absolute, or mailto:/data:
    value.startsWith('//') || // protocol-relative
    value.startsWith('#') // in-page anchor
  ) {
    return value;
  }
  const rootRelative = value.startsWith('/');
  const base = rootRelative ? resourceBase.root : resourceBase.base;
  if (!base) {
    return value;
  }
  try {
    // Root-relative paths are resolved against the repository root, so the
    // leading slash is dropped — keeping it would resolve against the host root.
    return new URL(
      rootRelative ? value.replace(/^\/+/, '') : value,
      withTrailingSlash(base),
    ).href;
  } catch {
    return value;
  }
};

// Custom renderer configuration
const createRenderer = (baseUrl = '', resolveViaResourceBase = false) => {
  const renderer = new marked.Renderer();

  // Override link rendering
  renderer.link = ({ href, title, tokens }) => {
    let url = href || '';

    // With a resource base, relative URLs are resolved once in safeAttrValue.
    // Joining here as well would turn `./x` into `/x`, i.e. reinterpret a
    // document-relative path as a repository-root-relative one.
    if (
      !resolveViaResourceBase &&
      !(url.startsWith('http://') || url.startsWith('https://'))
    ) {
      if (url.startsWith('.')) {
        url = baseUrl + url.substring(1);
      } else if (
        url.startsWith('/') ||
        url.startsWith('#') ||
        url.startsWith('?')
      ) {
        url = baseUrl + url;
      } else {
        url = baseUrl + '/' + url;
      }
    }

    return (
      '<a href="' +
      url +
      '"' +
      (title ? ' title="' + title + '"' : '') +
      ' target="_blank" rel="noopener noreferrer nofollow">' +
      renderer.parser.parseInline(tokens) +
      '</a>'
    );
  };

  // Override HTML rendering
  renderer.html = ({ text }) => {
    let html = text || '';
    if (html.startsWith('<video') && !html.includes('controls="controls"')) {
      html = html.replace('<video', '<video controls="controls"');
    }
    return html;
  };

  return renderer;
};

/**
 * Parse markdown to sanitized HTML.
 *
 * @param content       Raw markdown string
 * @param baseUrl       Base URL for resolving relative links (optional)
 * @param resourceBase  Bases for resolving the relative paths of a document
 *                      synced from a remote source, e.g. a GitHub README
 *                      (optional). Takes over relative URL resolution from
 *                      `baseUrl` when provided.
 * @returns             Sanitized HTML string
 */
export function parseMarkdown(
  content: string,
  baseUrl = '',
  resourceBase?: ResourceBase,
): string {
  const resolveBase = resourceBase?.base ? resourceBase : undefined;
  return xss(
    marked(content, {
      gfm: true,
      renderer: createRenderer(baseUrl, !!resolveBase),
      // Match GitHub Flavored Markdown: a soft source newline is whitespace,
      // while explicit Markdown/HTML hard breaks still render as <br>.
      breaks: false,
    }) as string,
    {
      whiteList: xssWhiteList,
      stripIgnoreTag: true,
      stripIgnoreTagBody,
      // Resolve after the default filter has run, so a hostile value (e.g.
      // `javascript:`) is already dropped and never reaches URL resolution.
      safeAttrValue: (tag, name, value, cssFilter) => {
        const safe = defaultSafeAttrValue(tag, name, value, cssFilter);
        if (!resolveBase || !safe || !RESOLVE_ATTRS[tag]?.includes(name)) {
          return safe;
        }
        return absolutizeUrl(safe, resolveBase);
      },
    },
  );
}
