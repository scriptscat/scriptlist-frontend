import { marked } from 'marked';
import xss, { whiteList as defaultWhiteList } from 'xss';

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

// Custom renderer configuration
const createRenderer = (baseUrl = '') => {
  const renderer = new marked.Renderer();

  // Override link rendering
  renderer.link = ({ href, title, tokens }) => {
    let url = href || '';

    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
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
 * @param content  Raw markdown string
 * @param baseUrl  Base URL for resolving relative links (optional)
 * @returns        Sanitized HTML string
 */
export function parseMarkdown(content: string, baseUrl = ''): string {
  return xss(
    marked(content, {
      gfm: true,
      renderer: createRenderer(baseUrl),
      // Match GitHub Flavored Markdown: a soft source newline is whitespace,
      // while explicit Markdown/HTML hard breaks still render as <br>.
      breaks: false,
    }) as string,
    {
      whiteList: xssWhiteList,
      stripIgnoreTag: true,
      stripIgnoreTagBody,
    },
  );
}
