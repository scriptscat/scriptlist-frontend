import { Marked } from 'marked';
import type { RendererObject } from 'marked';
import markedAlert from 'marked-alert';
import markedFootnote from 'marked-footnote';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import xss, {
  whiteList as defaultWhiteList,
  safeAttrValue as defaultSafeAttrValue,
  friendlyAttrValue,
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
// - class on div/p/section → the structures this pipeline itself emits (GitHub
//   alerts, the footnotes section)
//   GitHub does not allow `class` globally, so on every one of these tags the
//   *value* is filtered down to the class names that tag legitimately carries
//   (see below) — user content cannot smuggle arbitrary CSS classes in through
//   raw HTML.
// - input (not in GitHub's base) → GFM task-list checkboxes
// - video + source[src] → in-site video embeds (GitHub disallows <video>)
const APP_TAGS = ['input', 'video'];
const APP_ATTRS: Record<string, string[]> = {
  code: ['class'],
  pre: ['class'],
  span: ['class'],
  div: ['class'],
  p: ['class'],
  section: ['class'],
  input: ['type', 'checked', 'disabled'],
  video: ['src', 'controls', 'preload', 'poster'],
  source: ['src'],
};

// ---------------------------------------------------------------------------
// Value-filtered `class`.
//
// `class` is filtered on every tag it is allowed on, and each tag keeps only
// the class names this pipeline's own output can legitimately carry. Anything
// else in the value is dropped, and a value left with no allowed token drops
// the attribute entirely (see `onTagAttr`), so `<div class="fixed inset-0">`
// still renders as a bare `<div>` and cannot cover the page.
// ---------------------------------------------------------------------------

/** Structural classes the extensions emit (div/p/section). */
const STRUCTURE_CLASSES = new Set([
  // marked-alert
  'markdown-alert',
  'markdown-alert-note',
  'markdown-alert-tip',
  'markdown-alert-important',
  'markdown-alert-warning',
  'markdown-alert-caution',
  'markdown-alert-title',
  // footnotes
  'footnotes',
]);

// ---------------------------------------------------------------------------
// Syntax-highlighting classes (code/pre/span).
//
// Two different sources put a class on these tags, and only one of them reaches
// this filter:
//
//  * The *document* — marked's `language-*` on a fenced block's `<code>`, plus
//    whatever raw HTML the author wrote. That is what is filtered here.
//  * *Prism* — `Prism.highlightAllUnder` runs client-side from MarkdownView's
//    effect (./index.tsx), over the DOM already built from this sanitized HTML,
//    and rewrites the code element's innerHTML in place; nothing re-sanitizes
//    that. So its `token …` spans, the `language-*` it copies onto the parent
//    `<pre>`, and the loaded plugins' `code-toolbar` / `toolbar` /
//    `toolbar-item` / `copy-to-clipboard-button` are all out of this filter's
//    reach and need no entry below.
//
// The list therefore only has to keep highlighting *reachable*:
//
//  * `language-x` / `lang-x`, the two spellings Prism's own element selector
//    looks for (`code[class*="language-"], [class*="language-"] code,
//    code[class*="lang-"], [class*="lang-"] code` — `highlightAllUnder` in
//    node_modules/prismjs/prism.js), matched with Prism's own `[\w-]` character
//    class. Nothing in that shape can close the attribute.
//  * `token` plus the token types the theme styles. Prism emits `['token',
//    type]` (prism.js `Token.stringify`) and `type` is open-ended per grammar,
//    so it is not enumerable — but per the above it does not have to be: these
//    only cover markup that arrives pre-highlighted in the document, and every
//    rule attached to them is colour/weight/cursor. Derived from the vendored
//    theme, which is the local source of truth; re-derive with
//      grep -oE '\.token\.[a-zA-Z-]+' src/components/MarkdownView/prism.css
//    (parseMarkdown.test.ts re-runs that derivation against prism.css, so an
//    added or removed theme rule shows up as a test failure).
// ---------------------------------------------------------------------------
const PRISM_LANGUAGE_CLASS = /^lang(?:uage)?-[\w-]+$/i;

const PRISM_TOKEN_CLASSES = new Set([
  'token',
  'atrule',
  'attr-name',
  'attr-value',
  'block-comment',
  'bold',
  'boolean',
  'builtin',
  'cdata',
  'char',
  'class-name',
  'comment',
  'constant',
  'deleted',
  'doctype',
  'entity',
  'function',
  'function-name',
  'important',
  'inserted',
  'italic',
  'keyword',
  'namespace',
  'number',
  'operator',
  'prolog',
  'property',
  'punctuation',
  'regex',
  'selector',
  'string',
  'symbol',
  'tag',
  'url',
  'variable',
]);

const isStructureClass = (token: string): boolean =>
  STRUCTURE_CLASSES.has(token);

const isHighlightClass = (token: string): boolean =>
  PRISM_TOKEN_CLASSES.has(token) || PRISM_LANGUAGE_CLASS.test(token);

// Every tag `class` is allowed on, with the predicate its value is filtered by.
// A Map rather than a plain object so a tag named after an Object.prototype key
// (`constructor`, `toString`) cannot pick up a predicate that isn't there.
const CLASS_FILTERS = new Map<string, (token: string) => boolean>([
  ['div', isStructureClass],
  ['p', isStructureClass],
  ['section', isStructureClass],
  ['code', isHighlightClass],
  ['pre', isHighlightClass],
  ['span', isHighlightClass],
]);

// js-xss hands both `onTagAttr` and `safeAttrValue` the attribute value exactly
// as written in the source, entities and all, while the browser resolves
// `class="markdown-alert&#32;markdown-alert-note"` to two class names. Filtering
// the raw text fails closed rather than open — an unrecognised token is dropped
// — but it drops class names that *are* this pipeline's own as soon as a README
// spells a separator or a letter as an entity. So decode first, with js-xss's
// own `friendlyAttrValue` (the function its default `safeAttrValue` uses on
// every other attribute), and filter the decoded tokens. Order matters: the
// allowlist check runs after decoding, so `&#34;` becoming a real quote just
// makes the token unrecognised and dropped — it cannot smuggle one back into
// the attribute this function's result is written into unescaped.
const filterClassValue = (tag: string, value: string): string => {
  const isAllowed = CLASS_FILTERS.get(tag);
  return isAllowed
    ? friendlyAttrValue(value)
        .split(/\s+/)
        .filter((token) => isAllowed(token))
        .join(' ')
    : '';
};

const isFilteredClass = (tag: string, name: string): boolean =>
  name === 'class' && CLASS_FILTERS.has(tag);

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

// ---------------------------------------------------------------------------
// HTML escaping for values this pipeline concatenates into the tags it builds.
//
// Same character map as `marked`'s own internal `escape()` (see
// `escapeReplace` / `escapeReplaceNoEncode` in `marked/lib/marked.esm.js`),
// restated here because `marked` does not export it. `escapeHtml` matches
// marked's default "don't re-encode an existing entity" mode, the one its stock
// `link` renderer applies to a link title; `escapeHtmlEntities` is the
// encode-everything mode.
//
// For the *href*, marked reaches for `cleanUrl()` (`encodeURI`) rather than
// escaping. That is deliberately not copied: percent-encoding would rewrite
// `#安装` into `#%E5%AE%89%E8%A3%85`, and the whole point of design decision 6
// is that a README's `[跳转](#安装)` lands on `<h2 id="安装">` unchanged.
// Escaping closes the same hole — the value is re-parsed by js-xss downstream,
// and an escaped quote is not a delimiter to it.
// ---------------------------------------------------------------------------
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const ESCAPE_ALL = /[&<>"']/g;
const ESCAPE_NO_ENCODE = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g;

const escapeHtml = (value: string): string =>
  value.replace(ESCAPE_NO_ENCODE, (char) => HTML_ESCAPES[char]);

const escapeHtmlEntities = (value: string): string =>
  value.replace(ESCAPE_ALL, (char) => HTML_ESCAPES[char]);

// ---------------------------------------------------------------------------
// Custom renderer overrides (link/html), expressed as a `RendererObject` —
// the same shape `marked-gfm-heading-id` uses for its own `heading`
// override — and merged into the local `Marked` instance's renderer via the
// extension mechanism below (`new Marked(..., { renderer: createRendererOverrides(...) })`)
// instead of being supplied wholesale as a `renderer:` *parse-time* option.
//
// `Marked#use()` merges each extension's `renderer` methods one at a time
// onto a single shared `Renderer` instance kept on the `Marked` instance
// (each new method wraps the previous one). A `renderer:` option passed to
// `.parse()` instead *replaces* that merged instance outright — so a plain
// `new marked.Renderer()` with only `.link`/`.html` set here would silently
// drop `marked-gfm-heading-id`'s `heading` override and leave every
// `<h1>`-`<h6>` without an `id`. Going through `.use()` for these two methods
// too keeps them stacked correctly alongside the GFM extensions.
// ---------------------------------------------------------------------------
const createRendererOverrides = (
  baseUrl = '',
  resolveViaResourceBase = false,
): RendererObject => ({
  // Override link rendering
  link({ href, title, tokens }) {
    const url = href || '';

    // An in-page anchor (`#安装`, produced by heading ids below) is emitted
    // as-is: no baseUrl/resourceBase join (it never resolves against a
    // document), and no `target="_blank"` (it never leaves the page).
    // `rel="noopener noreferrer nofollow"` is dropped too — `noopener` /
    // `noreferrer` exist to protect against `window.opener` tabnabbing
    // through a new tab, which doesn't apply without `target="_blank"`, and
    // `nofollow` exists to withhold SEO credit from untrusted off-site
    // content, which doesn't apply to a same-page, same-origin fragment.
    if (url.startsWith('#')) {
      return (
        '<a href="' +
        escapeHtml(url) +
        '"' +
        (title ? ' title="' + escapeHtml(title) + '"' : '') +
        '>' +
        this.parser.parseInline(tokens) +
        '</a>'
      );
    }

    let resolved = url;

    // With a resource base, relative URLs are resolved once in safeAttrValue.
    // Joining here as well would turn `./x` into `/x`, i.e. reinterpret a
    // document-relative path as a repository-root-relative one.
    if (
      !resolveViaResourceBase &&
      !(url.startsWith('http://') || url.startsWith('https://'))
    ) {
      if (url.startsWith('.')) {
        resolved = baseUrl + url.substring(1);
      } else if (url.startsWith('/') || url.startsWith('?')) {
        resolved = baseUrl + url;
      } else {
        resolved = baseUrl + '/' + url;
      }
    }

    return (
      '<a href="' +
      escapeHtml(resolved) +
      '"' +
      (title ? ' title="' + escapeHtml(title) + '"' : '') +
      ' target="_blank" rel="noopener noreferrer nofollow">' +
      this.parser.parseInline(tokens) +
      '</a>'
    );
  },

  // Override HTML rendering
  html({ text }) {
    let html = text || '';
    if (html.startsWith('<video') && !html.includes('controls="controls"')) {
      html = html.replace('<video', '<video controls="controls"');
    }
    return html;
  },
});

// ---------------------------------------------------------------------------
// GFM extensions.
//
// They are registered on a *local* `Marked` instance instead of the shared
// `marked` singleton's `use()`: the singleton is imported across the app, so
// mutating it would silently change behavior for every other consumer.
//
// GitHub alerts (`> [!NOTE]`) come from `marked-alert`, whose own titles/icons
// are replaced through `variants`: the title has to follow the site language,
// and the bundled inline octicon `<svg>` could never survive sanitization
// (`svg` is removed together with its contents, see `stripIgnoreTagBody`), so
// the icon is drawn from CSS instead and the icon string is left empty here.
//
// Footnotes (`[^1]` … `[^1]: …`) come from `marked-footnote`, which emits a
// `<sup><a>…</a></sup>` reference in the body and, once, a trailing
// `<hr><section class="footnotes">…</section>` — `section` is one of the tags
// `class` is value-filtered on above (`CLASS_FILTERS`), and `footnotes` is in
// the set that filter keeps (`STRUCTURE_CLASSES`).
//
// Heading anchors (`## 安装` → `<h2 id="安装">`) come from
// `marked-gfm-heading-id`, which is `github-slugger` under the hood — the
// same slug rules GitHub itself uses. `prefix: ''` deliberately does not
// match GitHub's own `user-content-` prefix (design decision 6): GitHub
// needs that prefix because it keeps the unprefixed href around and patches
// the scroll target in with JS, but this pipeline doesn't, so a prefix would
// make an existing `[跳转](#安装)` or a legacy `<a name="安装">` point at
// nothing. The tradeoff — same-named headings in two separately rendered
// documents on one page collide — is accepted (see the design note's
// §已知限制).
// ---------------------------------------------------------------------------

/** Alert types GitHub recognizes, in `marked-alert`'s (lowercase) spelling. */
const ALERT_TYPES = ['note', 'tip', 'important', 'warning', 'caution'] as const;

/** Localized strings this parser embeds into its output. */
export type MarkdownLabels = Record<(typeof ALERT_TYPES)[number], string> & {
  /** Heading of the footnotes section at the end of the document. */
  footnotesHeading: string;
  /**
   * `aria-label` of a footnote's back-reference link. `{0}` is replaced by
   * `marked-footnote` with the footnote's own label, which comes from the
   * document rather than from `labels` — and is escaped separately, at the
   * token level, before rendering (see the `walkTokens` hook in
   * `createMarked` and `escapeFootnoteLabel`).
   */
  footnoteBackref: string;
};

/**
 * English by default, so the parser stays usable without an i18n context, and
 * the per-key fallback for anything a caller does not supply.
 */
const DEFAULT_LABELS: MarkdownLabels = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
  footnotesHeading: 'Footnotes',
  footnoteBackref: 'Back to reference {0}',
};

/**
 * `MarkdownLabels` types every label as a `string`, but they are not one by
 * construction: they come from a hand-edited locale JSON through the site's
 * translator, and `t.raw('footnote_backref')` — which
 * `buildMarkdownLabels` has to use, see useMarkdownParser.ts — returns whatever
 * that file holds, a nested object or a number included. Such a value reaching
 * `escapeHtmlEntities` throws (`value.replace is not a function`), and the
 * caller is a `useMemo` inside a client component, so the throw takes the whole
 * page down over one mistyped label.
 *
 * So degrade per key: a non-string simply is not a label, and the built-in
 * English one is used in its place. An empty string is a real (if useless)
 * label and is kept, matching what an empty `<h2></h2>` did before. Only the
 * keys `DEFAULT_LABELS` declares are read, so an extra key in the supplied
 * object cannot introduce one.
 */
const withDefaultLabels = (
  labels?: Partial<MarkdownLabels>,
): MarkdownLabels => {
  const merged = { ...DEFAULT_LABELS };
  if (!labels) {
    return merged;
  }
  for (const key of Object.keys(merged) as (keyof MarkdownLabels)[]) {
    const value = labels[key];
    if (typeof value === 'string') {
      merged[key] = value;
    }
  }
  return merged;
};

/**
 * Labels are plain text, but the extensions concatenate them straight into
 * their HTML. Escaping them here keeps that boundary explicit: the sanitizer
 * downstream cannot tell markup coming from a label apart from the markup this
 * pipeline emits itself, so a label carrying allowlisted tags (e.g.
 * `</p></div><div class="markdown-alert …">`) would otherwise restructure the
 * output rather than render as text.
 */
const escapeLabel = (label: string): string => escapeHtmlEntities(label);

/**
 * A footnote's label additionally has to survive being used as the
 * *replacement* argument of a `String#replace`: `marked-footnote` builds the
 * back-reference `aria-label` with `backRefLabel.replace('{0}', label)`, and
 * `$$`, `$&`, `` $` `` and `$'` in a replacement string are read as patterns,
 * not as text — `` $` `` splices in everything before the match, turning
 * `` [^a$`b] `` into `aria-label="Back to reference aBack to reference b"`.
 *
 * `escapeLabel` alone makes this worse rather than better: mapping `"` to
 * `&quot;` and `'` to `&#39;` turns a harmless `$"` in the source into a `$&`
 * trigger that was never there. So encode `$` itself — `&#36;` contains no
 * `$`, and js-xss decodes numeric entities in an attribute value, so a reader
 * still gets the label verbatim. The `encodeURIComponent` id/href built from
 * the label change shape for a label like this, but both ends are derived from
 * this same escaped value, so they keep pointing at each other.
 */
const escapeFootnoteLabel = (label: string): string =>
  escapeLabel(label).replace(/\$/g, '&#36;');

const createMarked = (
  labels: MarkdownLabels,
  baseUrl: string,
  resolveViaResourceBase: boolean,
) =>
  new Marked(
    markedAlert({
      variants: ALERT_TYPES.map((type) => ({
        type,
        icon: '',
        title: escapeLabel(labels[type]),
      })),
    }),
    markedFootnote({
      // Heading slugs carry no prefix (design decision 6, see the extensions
      // comment below), and `marked-footnote` defaults `prefixId` to
      // `footnote-` — so a heading reading `## footnote-1` slugs to the exact
      // id `marked-footnote` gives its first footnote item (`id="footnote-1"`),
      // and `## footnote-label` collides the same way with the footnotes
      // section's own `<h2 id="footnote-label">`. The footnotes section
      // renders after the heading in the DOM, so the browser resolves the
      // duplicate id to the heading and a footnote reference scrolls to the
      // wrong place. `prefixId` feeds all of it — the reference id/href, the
      // `<li>` item id, the back-reference href, and the section heading id
      // (`node_modules/marked-footnote/dist/index.js` functions `A` and `E`)
      // — so setting it here alone covers every collision site.
      //
      // What `user-content-fn-` (GitHub's own footnote id prefix) buys is
      // narrower than "no collisions": it moves the footnote ids off the slugs
      // README authors realistically write. It cannot do more. Any *fixed*
      // prefix is reachable from a heading, because a heading slug is just its
      // lowercased, hyphenated text — `## user-content-fn-1` and `## user
      // content fn 1` both slug to `user-content-fn-1` and still steal the
      // first footnote's scroll target, pinned in parseMarkdown.test.ts.
      // Closing that would mean prefixing heading slugs as well, which 决策 6
      // rules out (in-page `#安装` links have to keep working), so it is left
      // open: the author has to title a heading after this pipeline's internal
      // id scheme, and the cost is their own footnote link scrolling to their
      // own heading. See §已知限制 in the design doc.
      prefixId: 'user-content-fn-',
      // A visual divider between the body and the footnote section.
      footnoteDivider: true,
      // No class on the <h2>: the visual hiding is CSS anchored on `.footnotes`
      // (see markdown.css), deliberately not on Tailwind's `sr-only` — Tailwind
      // 4 only generates utilities it finds by scanning source, and a class
      // name assembled from a string (as `marked-footnote`'s default
      // `headingClass: 'sr-only'` would be here) is too fragile to depend on.
      // The heading stays in the DOM for screen readers regardless of class.
      headingClass: '',
      // Like the alert titles above, `description` and `backRefLabel` are
      // concatenated straight into HTML by `marked-footnote` (`description`
      // into the <h2> text content, `backRefLabel` into an `aria-label`
      // attribute value) rather than escaped, so they need the same
      // text-escaping treatment before they reach it.
      description: escapeLabel(labels.footnotesHeading),
      backRefLabel: escapeLabel(labels.footnoteBackref),
    }),
    // No `user-content-` prefix — see the extensions comment above (design
    // decision 6).
    gfmHeadingId({ prefix: '' }),
    // Merged via `.use()` rather than passed as a `.parse()`-time `renderer`
    // option — see the comment on `createRendererOverrides` for why.
    { renderer: createRendererOverrides(baseUrl, resolveViaResourceBase) },
    {
      // Escaping `backRefLabel` above only covers the label *we* supply: the
      // `{0}` in it is substituted by `marked-footnote` with the footnote's own
      // label, taken verbatim from the document and dropped into the
      // `aria-label` attribute unescaped (its own escaping only runs under
      // `keepLabels`). A document writing `[^a"><span class="…">]` therefore
      // closes that attribute and the enclosing `<a>`, which turns plain
      // Markdown — not just raw HTML — into a way to emit markup and leaves the
      // sanitizer as the only thing between it and the reader.
      //
      // So escape the label at the token level, before rendering — with
      // `escapeFootnoteLabel`, which also neutralises the `$` sequences
      // `marked-footnote`'s `backRefLabel.replace('{0}', label)` would
      // otherwise read as replacement patterns (see its doc comment). Both the
      // reference and the definition are rewritten with the same function, and
      // both derive their id/href from the label the same way
      // (`encodeURIComponent`), so the two ends of the anchor keep matching.
      walkTokens: (token) => {
        if (token.type === 'footnote' || token.type === 'footnoteRef') {
          const labelled = token as typeof token & { label: string };
          labelled.label = escapeFootnoteLabel(labelled.label);
        }
      },
    },
  );

/**
 * Parse markdown to sanitized HTML.
 *
 * @param content       Raw markdown string
 * @param baseUrl       Base URL for resolving relative links (optional)
 * @param resourceBase  Bases for resolving the relative paths of a document
 *                      synced from a remote source, e.g. a GitHub README
 *                      (optional). Takes over relative URL resolution from
 *                      `baseUrl` when provided.
 * @param labels        Localized strings embedded in the output, e.g. alert
 *                      titles and the footnotes section heading (optional,
 *                      defaults to English).
 * @returns             Sanitized HTML string
 */
export function parseMarkdown(
  content: string,
  baseUrl = '',
  resourceBase?: ResourceBase,
  labels?: Partial<MarkdownLabels>,
): string {
  const resolveBase = resourceBase?.base ? resourceBase : undefined;
  return xss(
    // `createMarked` runs fresh on every `parseMarkdown` call rather than
    // being memoized at module scope — but *not* because that scopes the
    // heading-slug dedupe. `marked-gfm-heading-id` keeps its slugger in
    // *module* scope and resets it from a `preprocess` hook on every parse
    // (node_modules/marked-gfm-heading-id/src/index.js), so per-instance
    // construction isolates nothing there: a shared instance parsing `## 安装`
    // twice yields `id="安装"` both times, verified directly. That extension's
    // internal reset is the only thing making "`安装` in doc A, `安装` again in
    // doc B" come out as two `安装`, whichever way the instance is built.
    //
    // The real reasons are the other two extensions and the price. This
    // instance is a function of the current call's arguments — `marked-alert`'s
    // variant titles come from `labels`, the renderer overrides from
    // `baseUrl`/`resourceBase` — and `marked-footnote` keeps its
    // document-scoped bookkeeping in a closure created by the
    // `markedFootnote(...)` call itself. A module-level instance would have to
    // be keyed by all of that and would still carry that bookkeeping between
    // documents; building per call keeps all three extensions on the same
    // footing. And it costs nothing worth measuring: task 1's review timed
    // `new Marked()` at ~2µs against ~95µs for the parse around it.
    createMarked(withDefaultLabels(labels), baseUrl, !!resolveBase).parse(
      content,
      {
        gfm: true,
        // Match GitHub Flavored Markdown: a soft source newline is whitespace,
        // while explicit Markdown/HTML hard breaks still render as <br>.
        breaks: false,
      },
    ) as string,
    {
      whiteList: xssWhiteList,
      stripIgnoreTag: true,
      stripIgnoreTagBody,
      onTagAttr: (tag, name, value) => {
        // js-xss keeps the bare attribute name when `safeAttrValue` returns an
        // empty string (`<div class>`). For a `class` filtered down to nothing
        // drop the attribute instead, so raw HTML keeps rendering exactly as it
        // did before `class` was allowed on these tags.
        if (isFilteredClass(tag, name) && !filterClassValue(tag, value)) {
          return '';
        }
        // Same for an empty `id`, by the same mechanism: a heading whose text
        // slugs to nothing (`## ![logo](./logo.png)`, or a bare `##`) still
        // gets `id=""` from `marked-gfm-heading-id`. An empty id is invalid
        // HTML — the attribute must hold at least one character — and can
        // never be an anchor target, so drop it rather than emit `<h2 id>`.
        // Decode first, like the `class` filter above: js-xss trims the raw
        // value before it gets here but decodes entities only afterwards, so
        // `id="&#9;"` would otherwise reach the sanitizer's own
        // `friendlyAttrValue` — which turns control characters into spaces and
        // trims — as a non-empty value and come out as the bare `<div id>`
        // this drop exists to prevent.
        if (name === 'id' && !friendlyAttrValue(value)) {
          return '';
        }
        return undefined;
      },
      safeAttrValue: (tag, name, value, cssFilter) => {
        // Value-filtered `class`: only this pipeline's own class names survive.
        // The result can only ever be tokens from a fixed allowlist or ones
        // matching `PRISM_LANGUAGE_CLASS`, neither of which can contain a quote
        // or a space, so it needs no escaping.
        if (isFilteredClass(tag, name)) {
          return filterClassValue(tag, value);
        }
        // Resolve after the default filter has run, so a hostile value (e.g.
        // `javascript:`) is already dropped and never reaches URL resolution.
        const safe = defaultSafeAttrValue(tag, name, value, cssFilter);
        if (!resolveBase || !safe || !RESOLVE_ATTRS[tag]?.includes(name)) {
          return safe;
        }
        return absolutizeUrl(safe, resolveBase);
      },
    },
  );
}
