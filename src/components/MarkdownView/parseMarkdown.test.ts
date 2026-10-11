import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './parseMarkdown';
import type { MarkdownLabels } from './parseMarkdown';

// ---------------------------------------------------------------------------
// GitHub alerts (`> [!NOTE]` …), see
// docs/superpowers/specs/2026-07-31-markdown-gfm-extensions-design.md
// ---------------------------------------------------------------------------
describe('parseMarkdown: GitHub alerts', () => {
  it('renders `> [!IMPORTANT]` as a markdown-alert block', () => {
    expect(parseMarkdown('> [!IMPORTANT]\n> 正文')).toBe(
      '<div class="markdown-alert markdown-alert-important">\n' +
        '<p class="markdown-alert-title">Important</p>\n' +
        '<p>正文</p>\n' +
        '</div>\n',
    );
  });

  it.each([
    ['NOTE', 'note', 'Note'],
    ['TIP', 'tip', 'Tip'],
    ['IMPORTANT', 'important', 'Important'],
    ['WARNING', 'warning', 'Warning'],
    ['CAUTION', 'caution', 'Caution'],
  ])('renders `> [!%s]`', (marker, variant, title) => {
    expect(parseMarkdown(`> [!${marker}]\n> body`)).toBe(
      `<div class="markdown-alert markdown-alert-${variant}">\n` +
        `<p class="markdown-alert-title">${title}</p>\n` +
        '<p>body</p>\n' +
        '</div>\n',
    );
  });

  it('titles the alert with the supplied labels', () => {
    expect(
      parseMarkdown('> [!WARNING]\n> body', '', undefined, {
        note: '注意',
        tip: '提示',
        important: '重要',
        warning: '警告',
        caution: '警告',
      }),
    ).toBe(
      '<div class="markdown-alert markdown-alert-warning">\n' +
        '<p class="markdown-alert-title">警告</p>\n' +
        '<p>body</p>\n' +
        '</div>\n',
    );
  });

  // A label is plain text, not markup. `marked-alert` concatenates the title
  // straight into its HTML, and the sanitizer cannot tell markup coming from a
  // label apart from the markup this pipeline emits itself — a label carrying
  // allowlisted tags would close the alert and open a forged one.
  it('escapes markup in the supplied labels', () => {
    expect(
      parseMarkdown('> [!NOTE]\n> body', '', undefined, {
        note:
          '</p></div><div class="markdown-alert markdown-alert-caution">' +
          '<p class="markdown-alert-title">A & B',
      }),
    ).toBe(
      '<div class="markdown-alert markdown-alert-note">\n' +
        '<p class="markdown-alert-title">' +
        '&lt;/p&gt;&lt;/div&gt;&lt;div class=&quot;markdown-alert markdown-alert-caution&quot;&gt;' +
        '&lt;p class=&quot;markdown-alert-title&quot;&gt;A &amp; B' +
        '</p>\n' +
        '<p>body</p>\n' +
        '</div>\n',
    );
  });

  it('keeps multi-paragraph alert bodies inside the alert', () => {
    expect(parseMarkdown('> [!NOTE]\n> first\n>\n> second')).toBe(
      '<div class="markdown-alert markdown-alert-note">\n' +
        '<p class="markdown-alert-title">Note</p>\n' +
        '<p>first</p>\n' +
        '<p>second</p>\n' +
        '</div>\n',
    );
  });

  // GitHub only recognises the uppercase marker; everything else stays a quote.
  it('does not recognise a lowercase `> [!note]`', () => {
    expect(parseMarkdown('> [!note]\n> body')).toBe(
      '<blockquote>\n<p>[!note]\nbody</p>\n</blockquote>\n',
    );
  });

  it('does not recognise an unknown `> [!SOMETHING]`', () => {
    expect(parseMarkdown('> [!SOMETHING]\n> body')).toBe(
      '<blockquote>\n<p>[!SOMETHING]\nbody</p>\n</blockquote>\n',
    );
  });

  it('leaves a plain blockquote byte-identical', () => {
    expect(parseMarkdown('> quote')).toBe(
      '<blockquote>\n<p>quote</p>\n</blockquote>\n',
    );
  });
});

// ---------------------------------------------------------------------------
// §安全、兼容性、可访问性 of
// docs/superpowers/specs/2026-07-31-markdown-gfm-extensions-design.md requires
// that adding the extensions above does not change the output of pre-existing
// GFM syntax "逐字不变" (byte-for-byte). Plain blockquotes are pinned above;
// this closes the same gap for tables, task lists, strikethrough, and
// autolinks, none of which were pinned anywhere before.
// ---------------------------------------------------------------------------
describe('parseMarkdown: pre-existing GFM syntax stays byte-identical', () => {
  it('renders a GFM table, with an alignment row rendered as `align` attributes', () => {
    expect(
      parseMarkdown(
        '| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |',
      ),
    ).toBe(
      '<table>\n' +
        '<thead>\n' +
        '<tr>\n' +
        '<th align="left">Left</th>\n' +
        '<th align="center">Center</th>\n' +
        '<th align="right">Right</th>\n' +
        '</tr>\n' +
        '</thead>\n' +
        '<tbody><tr>\n' +
        '<td align="left">a</td>\n' +
        '<td align="center">b</td>\n' +
        '<td align="right">c</td>\n' +
        '</tr>\n' +
        '</tbody></table>\n',
    );
  });

  it('renders a task list with a checked and an unchecked item as disabled checkboxes', () => {
    expect(parseMarkdown('- [x] done\n- [ ] todo')).toBe(
      '<ul>\n' +
        '<li><input checked disabled type="checkbox"> done</li>\n' +
        '<li><input disabled type="checkbox"> todo</li>\n' +
        '</ul>\n',
    );
  });

  it('renders strikethrough as `<del>`', () => {
    expect(parseMarkdown('~~gone~~')).toBe('<p><del>gone</del></p>\n');
  });

  it('renders a bare URL as an autolink, with the same target/rel treatment as an explicit link', () => {
    expect(parseMarkdown('see https://example.com for info')).toBe(
      '<p>see <a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">https://example.com</a> for info</p>\n',
    );
  });

  // Pins that the `#`-link renderer change from this round (design decision 7,
  // see the "`#` link rendering" and "non-`#` links are unchanged" describe
  // blocks below) left a bare-URL autolink sitting next to an explicit
  // non-`#` link untouched — neither loses its `target`/`rel`, and neither is
  // mistaken for the other.
  it('renders an autolink alongside an explicit link identically, unaffected by the `#`-link change', () => {
    expect(
      parseMarkdown(
        'see https://example.com and [click here](https://example.org)',
      ),
    ).toBe(
      '<p>see <a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">https://example.com</a> and ' +
        '<a href="https://example.org" target="_blank" rel="noopener noreferrer nofollow">click here</a></p>\n',
    );
  });
});

// ---------------------------------------------------------------------------
// GFM footnotes (`text[^1]` … `[^1]: note`), see
// docs/superpowers/specs/2026-07-31-markdown-gfm-extensions-design.md
// ---------------------------------------------------------------------------
describe('parseMarkdown: footnotes', () => {
  it('renders a reference and a footnote section with a back-reference link', () => {
    expect(parseMarkdown('text[^1]\n\n[^1]: the note')).toBe(
      '<p>text<sup><a id="user-content-fn-ref-1" href="#user-content-fn-1" aria-describedby="user-content-fn-label">1</a></sup></p>\n' +
        '<hr>\n' +
        '<section class="footnotes">\n' +
        '<h2 id="user-content-fn-label">Footnotes</h2>\n' +
        '<ol>\n' +
        '<li id="user-content-fn-1">\n' +
        '<p>the note <a href="#user-content-fn-ref-1" aria-label="Back to reference 1">↩</a></p>\n' +
        '</li>\n' +
        '</ol>\n' +
        '</section>\n',
    );
  });

  it('titles the footnotes heading and back-reference with the supplied labels', () => {
    expect(
      parseMarkdown('text[^1]\n\n[^1]: the note', '', undefined, {
        footnotesHeading: '脚注',
        footnoteBackref: '返回引用 {0}',
      }),
    ).toContain('<h2 id="user-content-fn-label">脚注</h2>');
    expect(
      parseMarkdown('text[^1]\n\n[^1]: the note', '', undefined, {
        footnotesHeading: '脚注',
        footnoteBackref: '返回引用 {0}',
      }),
    ).toContain('aria-label="返回引用 1"');
  });

  it('escapes markup in the supplied footnotes heading label', () => {
    expect(
      parseMarkdown('text[^1]\n\n[^1]: the note', '', undefined, {
        footnotesHeading: '</h2></section><script>alert(1)</script>',
      }),
    ).toContain(
      '<h2 id="user-content-fn-label">' +
        '&lt;/h2&gt;&lt;/section&gt;&lt;script&gt;alert(1)&lt;/script&gt;' +
        '</h2>',
    );
  });

  it('collapses multiple references to the same footnote into one entry with a numbered back-reference for each', () => {
    expect(parseMarkdown('a[^1] b[^1]\n\n[^1]: note')).toBe(
      '<p>a<sup><a id="user-content-fn-ref-1" href="#user-content-fn-1" aria-describedby="user-content-fn-label">1</a></sup> ' +
        'b<sup><a id="user-content-fn-ref-1-2" href="#user-content-fn-1" aria-describedby="user-content-fn-label">1</a></sup></p>\n' +
        '<hr>\n' +
        '<section class="footnotes">\n' +
        '<h2 id="user-content-fn-label">Footnotes</h2>\n' +
        '<ol>\n' +
        '<li id="user-content-fn-1">\n' +
        '<p>note ' +
        '<a href="#user-content-fn-ref-1" aria-label="Back to reference 1">↩</a> ' +
        '<a href="#user-content-fn-ref-1-2" aria-label="Back to reference 1">↩<sup>2</sup></a></p>\n' +
        '</li>\n' +
        '</ol>\n' +
        '</section>\n',
    );
  });

  it('keeps a definition containing more than one paragraph inside the same entry', () => {
    expect(
      parseMarkdown(
        'text[^1]\n\n[^1]: first paragraph\n\n    second paragraph',
      ),
    ).toBe(
      '<p>text<sup><a id="user-content-fn-ref-1" href="#user-content-fn-1" aria-describedby="user-content-fn-label">1</a></sup></p>\n' +
        '<hr>\n' +
        '<section class="footnotes">\n' +
        '<h2 id="user-content-fn-label">Footnotes</h2>\n' +
        '<ol>\n' +
        '<li id="user-content-fn-1">\n' +
        '<p>first paragraph</p>\n' +
        '<p>second paragraph ' +
        '<a href="#user-content-fn-ref-1" aria-label="Back to reference 1">↩</a></p>\n' +
        '</li>\n' +
        '</ol>\n' +
        '</section>\n',
    );
  });

  it('leaves an undefined reference as literal text and does not crash', () => {
    expect(parseMarkdown('text[^missing]')).toBe('<p>text[^missing]</p>\n');
  });

  // The footnote's id/href use the source label text, not the displayed
  // number — only the displayed `<sup>` number is sequential by reference
  // order, so this test uses distinct labels to keep the two independent
  // axes (id vs. display order) from being conflated.
  it('renders definitions in first-reference order regardless of source order', () => {
    expect(
      parseMarkdown('a[^second] b[^first]\n\n[^first]: 1st\n\n[^second]: 2nd'),
    ).toBe(
      '<p>a<sup><a id="user-content-fn-ref-second" href="#user-content-fn-second" aria-describedby="user-content-fn-label">1</a></sup> ' +
        'b<sup><a id="user-content-fn-ref-first" href="#user-content-fn-first" aria-describedby="user-content-fn-label">2</a></sup></p>\n' +
        '<hr>\n' +
        '<section class="footnotes">\n' +
        '<h2 id="user-content-fn-label">Footnotes</h2>\n' +
        '<ol>\n' +
        '<li id="user-content-fn-second">\n' +
        '<p>2nd <a href="#user-content-fn-ref-second" aria-label="Back to reference second">↩</a></p>\n' +
        '</li>\n' +
        '<li id="user-content-fn-first">\n' +
        '<p>1st <a href="#user-content-fn-ref-first" aria-label="Back to reference first">↩</a></p>\n' +
        '</li>\n' +
        '</ol>\n' +
        '</section>\n',
    );
  });

  it('keeps the footnotes section class alive through the value filter', () => {
    expect(parseMarkdown('text[^1]\n\n[^1]: note')).toContain(
      '<section class="footnotes">',
    );
  });

  // markdown.css hides this heading visually while leaving it in the DOM for
  // screen readers. Both `class="footnotes"` and `id` survive sanitization on
  // author-written raw HTML, so that rule is keyed on the *whole* shape this
  // parser emits — `section.footnotes > h2#<the id below>` — and the two have
  // to be checked against each other from one place, or a change to `prefixId`
  // silently unhides the heading (and a looser selector silently hides an
  // author's own `<h2>`; see the rule's comment in markdown.css).
  it('emits the footnotes heading id that markdown.css’s hiding rule is keyed on', () => {
    const headingId = /<section class="footnotes">\n<h2 id="([^"]+)">/.exec(
      parseMarkdown('text[^1]\n\n[^1]: note'),
    )?.[1];
    const css = readFileSync(
      new URL('./markdown.css', import.meta.url),
      'utf8',
    );

    expect(headingId).toBe('user-content-fn-label');
    expect(css).toContain(`.markdown-body section.footnotes > h2#${headingId}`);
  });

  // A definition nobody references is dropped along with its content, matching
  // cmark-gfm; the surrounding document is untouched and no section is emitted.
  it('drops a definition that is never referenced', () => {
    expect(parseMarkdown('hello\n\n[^1]: orphan')).toBe('<p>hello</p>\n');
  });

  // Labels are typed `string`, but they come from hand-edited locale JSON and
  // reach here through `t.raw('footnote_backref')`, which hands back whatever
  // the file holds — a nested object or a number included. Escaping used to
  // call `String#replace` on it and throw, and the caller is a `useMemo` inside
  // a client component (useMarkdownParser), so that throw blanked the whole
  // page rather than mislabelling one link. Degrade per key instead.
  it('falls back to the built-in label when a supplied one is not a string', () => {
    const html = parseMarkdown(
      '> [!NOTE]\n> body\n\ntext[^1]\n\n[^1]: note',
      '',
      undefined,
      {
        note: 42,
        footnotesHeading: null,
        footnoteBackref: { nested: 'object' },
      } as unknown as Partial<MarkdownLabels>,
    );

    expect(html).toContain('<p class="markdown-alert-title">Note</p>');
    expect(html).toContain('<h2 id="user-content-fn-label">Footnotes</h2>');
    expect(html).toContain('aria-label="Back to reference 1"');
  });

  // A label that *is* a string is still used verbatim, including an empty one.
  it('keeps a supplied empty label instead of falling back', () => {
    expect(
      parseMarkdown('text[^1]\n\n[^1]: note', '', undefined, {
        footnotesHeading: '',
      }),
    ).toContain('<h2 id="user-content-fn-label"></h2>');
  });

  // Both extensions are registered on the same local `Marked` instance, so a
  // document using both has to keep working — including a reference that sits
  // inside an alert body while its section lands after the alert.
  it('renders a footnote referenced from inside an alert', () => {
    expect(parseMarkdown('> [!NOTE]\n> body[^1]\n\n[^1]: note')).toBe(
      '<div class="markdown-alert markdown-alert-note">\n' +
        '<p class="markdown-alert-title">Note</p>\n' +
        '<p>body<sup><a id="user-content-fn-ref-1" href="#user-content-fn-1" aria-describedby="user-content-fn-label">1</a></sup></p>\n' +
        '</div>\n' +
        '<hr>\n' +
        '<section class="footnotes">\n' +
        '<h2 id="user-content-fn-label">Footnotes</h2>\n' +
        '<ol>\n' +
        '<li id="user-content-fn-1">\n' +
        '<p>note <a href="#user-content-fn-ref-1" aria-label="Back to reference 1">↩</a></p>\n' +
        '</li>\n' +
        '</ol>\n' +
        '</section>\n',
    );
  });

  // The label is document content, and `marked-footnote` substitutes it into
  // `backRefLabel`'s `{0}` and drops the result into an `aria-label` attribute
  // unescaped (its own escape only runs under `keepLabels`). A double quote
  // therefore closes that attribute — so plain Markdown syntax, not just raw
  // HTML, becomes a way to emit markup, and the sanitizer is left as the only
  // thing between it and the reader.
  it('escapes a footnote label before it reaches the back-reference aria-label', () => {
    expect(parseMarkdown('text[^a"b]\n\n[^a"b]: note')).toBe(
      '<p>text<sup><a id="user-content-fn-ref-a%26quot%3Bb" href="#user-content-fn-a%26quot%3Bb" aria-describedby="user-content-fn-label">1</a></sup></p>\n' +
        '<hr>\n' +
        '<section class="footnotes">\n' +
        '<h2 id="user-content-fn-label">Footnotes</h2>\n' +
        '<ol>\n' +
        '<li id="user-content-fn-a%26quot%3Bb">\n' +
        '<p>note <a href="#user-content-fn-ref-a%26quot%3Bb" aria-label="Back to reference a&quot;b">↩</a></p>\n' +
        '</li>\n' +
        '</ol>\n' +
        '</section>\n',
    );
  });

  // Breaking out of the `aria-label` also breaks out of the enclosing <a>: the
  // injected `<span>` is left unclosed and carries an arbitrary class value,
  // which `span` (unlike div/p/section) is not value-filtered for because Prism
  // needs any value there. That is the full-page overlay the design note's
  // `class` decision exists to prevent.
  it('cannot inject markup into the page through a footnote label', () => {
    const overlay = 'a"><span class="fixed inset-0 z-50 bg-black">';
    const html = parseMarkdown(`text[^${overlay}]\n\n[^${overlay}]: note`);
    expect(html).not.toContain('<span');
    expect(html).not.toContain('class="fixed inset-0 z-50 bg-black"');
  });

  // `marked-footnote` builds the back-reference `aria-label` with
  // `backRefLabel.replace('{0}', label)` — a *string* replacement, so `$$`,
  // `$&`, "$`" and "$'" inside the label are read as replacement patterns
  // rather than as text. The label escaping above makes that worse instead of
  // better: it turns `"` into `&quot;` and `'` into `&#39;`, so a `$` sitting
  // in front of one of them *becomes* a `$&` trigger that was not in the
  // source. Screen-reader-only impact, but silently wrong — "$`" reproduced
  // the whole label prefix ("Back to reference aBack to reference b").
  it.each([
    ["a$'b", "Back to reference a$'b"],
    ['a$`b', 'Back to reference a$`b'],
    ['a$&b', 'Back to reference a$&amp;b'],
    ['a$$b', 'Back to reference a$$b'],
    ['a$"b', 'Back to reference a$&quot;b'],
  ])(
    'keeps a `$` sequence in the label out of the back-reference aria-label (%s)',
    (label, expected) => {
      expect(parseMarkdown(`text[^${label}]\n\n[^${label}]: note`)).toContain(
        `aria-label="${expected}"`,
      );
    },
  );

  // Escaping happens per token before rendering, and the reference and the
  // definition derive their ids from the label independently — escaping one
  // more times than the other would silently break the anchor in both
  // directions.
  it('keeps a reference and its definition pointing at each other for a label needing escapes', () => {
    const html = parseMarkdown('text[^a&b]\n\n[^a&b]: note');
    const ref = /<sup><a id="([^"]+)" href="#([^"]+)"/.exec(html);
    const definitionId = /<li id="([^"]+)">/.exec(html);
    const backref = /<p>note <a href="#([^"]+)"/.exec(html);
    expect(ref?.[2]).toBe(definitionId?.[1]);
    expect(backref?.[1]).toBe(ref?.[1]);
  });
});

// ---------------------------------------------------------------------------
// Footnote ids vs. heading slugs. `marked-gfm-heading-id` gives headings
// unprefixed slugs (design decision 6), so a heading whose text happens to
// slug to a footnote id collides with it. `marked-footnote`'s `prefixId` is
// set to `user-content-fn-` (GitHub's own footnote id prefix), which moves the
// footnote ids off the slugs README authors realistically write — the two
// tests below — but does not and cannot close the collision: a heading can
// always be written to slug to whatever the prefix is, which the last two
// tests pin. See the comment on the `markedFootnote(...)` call in
// parseMarkdown.ts.
// ---------------------------------------------------------------------------
describe('parseMarkdown: footnote id prefix avoids realistic heading collisions, but a heading that spells out the prefix still collides (pinned, not fixed)', () => {
  // The task's goal sentence, verbatim: a `## footnote-1` heading used to
  // slug to the same unprefixed id (`footnote-1`) that `marked-footnote`
  // gave its first footnote item, so the reference scrolled to the heading
  // instead of the footnote (the footnote section renders after the heading
  // in the DOM, so the browser resolves the duplicate id to the heading).
  it('keeps a `## footnote-1` heading and a footnote item with distinct ids, and the reference pointing at the item', () => {
    const html = parseMarkdown('## footnote-1\n\ntext[^1]\n\n[^1]: the note');
    const headingId = /<h2 id="([^"]+)">footnote-1<\/h2>/.exec(html);
    const itemId = /<li id="([^"]+)">/.exec(html);
    const refHref = /<sup><a id="[^"]+" href="#([^"]+)"/.exec(html);
    expect(headingId?.[1]).toBe('footnote-1');
    expect(itemId?.[1]).not.toBe(headingId?.[1]);
    expect(refHref?.[1]).toBe(itemId?.[1]);
  });

  // Same collision, other side: `marked-footnote` also ids the footnotes
  // *section* heading itself (`<h2 id="{prefix}label">`), which a `##
  // footnote-label` heading used to collide with the same way.
  it('keeps a `## footnote-label` heading and the footnotes section heading with distinct ids', () => {
    const html = parseMarkdown(
      '## footnote-label\n\ntext[^1]\n\n[^1]: the note',
    );
    const headingId = /<h2 id="([^"]+)">footnote-label<\/h2>/.exec(html);
    const sectionHeadingId = /<h2 id="([^"]+)">Footnotes<\/h2>/.exec(html);
    expect(headingId?.[1]).toBe('footnote-label');
    expect(sectionHeadingId?.[1]).not.toBe(headingId?.[1]);
  });

  // What the prefix does *not* buy, pinned so nobody has to take a comment's
  // word for it. `user-content-fn-1` is not an exotic string a heading could
  // only reach on purpose: it is exactly what `## user-content-fn-1` slugs to,
  // and the collision that follows is the original symptom verbatim. Left
  // unfixed on purpose (see the block comment above); this test exists to keep
  // the claim honest and to go red if a later change ever does close it.
  it('still collides when a heading slugs to a footnote id, and the reference then points at the heading', () => {
    const html = parseMarkdown(
      '## user-content-fn-1\n\ntext[^1]\n\n[^1]: the note',
    );
    const headingId = /<h2 id="([^"]+)">user-content-fn-1<\/h2>/.exec(html);
    const itemId = /<li id="([^"]+)">/.exec(html);
    const refHref = /<sup><a id="[^"]+" href="#([^"]+)"/.exec(html);

    expect(headingId?.[1]).toBe('user-content-fn-1');
    expect(itemId?.[1]).toBe('user-content-fn-1');
    expect(refHref?.[1]).toBe('user-content-fn-1');
    // Two elements now answer to that id, and the browser resolves the
    // reference to whichever comes first in the DOM — the heading.
    expect(html.indexOf('<h2 id="user-content-fn-1">')).toBeLessThan(
      html.indexOf('<li id="user-content-fn-1">'),
    );
  });

  // The comment this replaces dismissed the collision as needing a heading
  // titled "user content fn 1". That spelling slugs to the hyphenated id too,
  // so it is the same collision, not a more far-fetched one.
  it('reaches the same id from the spaced spelling of that heading', () => {
    expect(parseMarkdown('## user content fn 1')).toContain(
      '<h2 id="user-content-fn-1">',
    );
  });
});

// ---------------------------------------------------------------------------
// The `class` allowance added for alerts is value-filtered: only the class
// tokens this pipeline emits survive, so user content cannot smuggle arbitrary
// CSS classes (e.g. Tailwind's `fixed inset-0`) into the page.
// ---------------------------------------------------------------------------
describe('parseMarkdown: class value filtering', () => {
  it('strips author-supplied classes from a raw <div>', () => {
    expect(parseMarkdown('<div class="fixed inset-0">raw div</div>')).toBe(
      '<div>raw div</div>',
    );
  });

  it('keeps only pipeline class tokens on div/p/section', () => {
    expect(
      parseMarkdown('<div class="markdown-alert fixed inset-0">x</div>'),
    ).toBe('<div class="markdown-alert">x</div>');
    expect(parseMarkdown('<p class="markdown-alert-title z-50">x</p>')).toBe(
      '<p class="markdown-alert-title">x</p>',
    );
    expect(
      parseMarkdown('<section class="footnotes bg-black">x</section>'),
    ).toBe('<section class="footnotes">x</section>');
  });

  // js-xss inserts whatever `safeAttrValue` returns between the quotes without
  // escaping it (xss/lib/xss.js), so the filter's "only fixed tokens survive"
  // property is what keeps a hostile class value from closing the attribute.
  it('cannot break out of the class attribute', () => {
    expect(
      parseMarkdown(
        '<div class=\'markdown-alert" onmouseover="alert(1)\'>x</div>',
      ),
    ).toBe('<div>x</div>');
    expect(
      parseMarkdown(
        '<div class=\'markdown-alert x" onmouseover="alert(1)\'>x</div>',
      ),
    ).toBe('<div class="markdown-alert">x</div>');
  });

  // Behaviour change: this used to read "keeps arbitrary class values on
  // code/pre/span (Prism)" and asserted that `class="anything at all"` survived
  // on a <pre>. That allowance *was* the hole — see the describe block below,
  // which now owns the full code/pre/span behaviour (its `language-*` and
  // `token …` cases are the two assertions this test previously made alongside
  // the arbitrary one).
  it('no longer keeps arbitrary class values on code/pre/span', () => {
    expect(
      parseMarkdown('<pre class="anything at all"><code>x</code></pre>'),
    ).toBe('<pre><code>x</code></pre>');
  });

  // js-xss hands `onTagAttr`/`safeAttrValue` the *raw* attribute value, entities
  // and all, while the browser would see the decoded one. Filtering the raw
  // value fails closed (an unrecognised token is dropped), but it drops class
  // names that are legitimately this pipeline's own once a README writes them
  // with an entity-encoded separator or letter.
  it('decodes entities in the class value before filtering it', () => {
    expect(
      parseMarkdown(
        '<div class="markdown-alert&#32;markdown-alert-note">x</div>',
      ),
    ).toBe('<div class="markdown-alert markdown-alert-note">x</div>');
    expect(parseMarkdown('<span class="&#116;oken keyword">x</span>')).toBe(
      '<p><span class="token keyword">x</span></p>\n',
    );
  });

  // The flip side of decoding: the filter has to run *after* it, or an
  // entity-encoded quote would smuggle a token past the allowlist and back out
  // of the attribute.
  it('cannot break out of the class attribute with an entity-encoded quote', () => {
    expect(
      parseMarkdown(
        '<div class="markdown-alert&#34; onmouseover=&#34;alert(1)">x</div>',
      ),
    ).toBe('<div>x</div>');
    // `keyword"` is one token once decoded — the quote is part of it, so it is
    // dropped along with the payload rather than surviving as `keyword`.
    expect(
      parseMarkdown(
        '<span class="token&#32;keyword&#34; onmouseover=&#34;alert(1)">x</span>',
      ),
    ).toBe('<p><span class="token">x</span></p>\n');
  });
});

// ---------------------------------------------------------------------------
// The same value filter on code/pre/span. These three tags used to pass any
// `class` value through — Prism needs `language-*` and emits `token …` — which
// left exactly the hole the div/p/section filter exists to close: a script
// description synced from an arbitrary GitHub README could carry
// `<span class="fixed inset-0 z-50 bg-black">` and get a full-viewport overlay,
// because all four of those utilities occur in `src/` and Tailwind 4 therefore
// generates them.
//
// Prism's own classes are *not* subject to this filter: `Prism.highlightAllUnder`
// runs client-side in MarkdownView's effect, on the DOM built from this already
// sanitized HTML (it rewrites `innerHTML` directly, nothing re-sanitizes it).
// So the only classes the filter has to let through are the ones present in the
// author's markdown/HTML before highlighting.
// ---------------------------------------------------------------------------
describe('parseMarkdown: class value filtering on code/pre/span', () => {
  // The demonstrated hole, verbatim.
  it('strips a full-viewport overlay smuggled in through a <span>', () => {
    expect(
      parseMarkdown('<span class="fixed inset-0 z-50 bg-black">x</span>'),
    ).toBe('<p><span>x</span></p>\n');
  });

  it('strips author-supplied utilities from a raw <code> and <pre>', () => {
    expect(
      parseMarkdown('<code class="fixed inset-0 z-50 bg-black">x</code>'),
    ).toBe('<p><code>x</code></p>\n');
    expect(
      parseMarkdown('<pre class="fixed inset-0 z-50 bg-black">x</pre>'),
    ).toBe('<pre>x</pre>');
  });

  // A partially hostile value keeps only its highlighting-relevant tokens.
  it('keeps only the highlighting tokens of a mixed value', () => {
    expect(
      parseMarkdown(
        '<pre class="language-js fixed inset-0"><code>x</code></pre>',
      ),
    ).toBe('<pre class="language-js"><code>x</code></pre>');
  });

  // What marked emits for a fenced block with a language, and what Prism needs
  // to find it. Prism runs in the browser, so this asserts the parser output.
  it('keeps `language-*` on a fenced code block', () => {
    expect(parseMarkdown('```js\nconst a = 1;\n```')).toBe(
      '<pre><code class="language-js">const a = 1;\n</code></pre>\n',
    );
  });

  // Prism's selector (node_modules/prismjs/prism.js, `highlightAllUnder`):
  // `code[class*="language-"], [class*="language-"] code, code[class*="lang-"],
  //  [class*="lang-"] code` — so both spellings, on `code` or on an ancestor,
  // have to survive for raw HTML too.
  it('keeps every class Prism selects highlightable elements by', () => {
    expect(
      parseMarkdown(
        '<pre class="language-ts"><code class="lang-ts">x</code></pre>',
      ),
    ).toBe('<pre class="language-ts"><code class="lang-ts">x</code></pre>');
  });

  // Derived, not hand-typed: the vendored theme is the local source of truth
  // for the token classes Prism's output is styled by. Re-derive with
  //   grep -oE '\.token\.[a-zA-Z-]+' src/components/MarkdownView/prism.css
  it('keeps every token class the vendored prism.css theme styles', () => {
    const css = readFileSync(new URL('./prism.css', import.meta.url), 'utf8');
    const themed = Array.from(
      new Set(Array.from(css.matchAll(/\.token\.([\w-]+)/g), (m) => m[1])),
    );
    expect(themed.length).toBeGreaterThan(30);
    for (const name of themed) {
      expect(parseMarkdown(`<span class="token ${name}">x</span>`)).toBe(
        `<p><span class="token ${name}">x</span></p>\n`,
      );
    }
  });

  // Deliberate decision: an author-written `token …` value passes, because
  // every class in that set is a cosmetic theme hook (color/weight/cursor) that
  // Prism produces itself client-side — filtering it would protect nothing and
  // would unstyle pre-highlighted HTML pasted into a README.
  it('lets an author-written `token keyword` value through', () => {
    expect(parseMarkdown('<span class="token keyword">x</span>')).toBe(
      '<p><span class="token keyword">x</span></p>\n',
    );
  });

  // The flip side of deriving the set from the theme: a grammar-specific token
  // type the theme does not style is dropped from author HTML. Prism re-adds it
  // at runtime on anything it actually highlights, so nothing visible is lost.
  it('drops a token type the theme does not style', () => {
    expect(parseMarkdown('<span class="token template-string">x</span>')).toBe(
      '<p><span class="token">x</span></p>\n',
    );
  });

  // Same property the div/p/section filter relies on: js-xss inserts whatever
  // the filter returns between the quotes unescaped, so the surviving tokens
  // must be incapable of closing the attribute.
  it('cannot break out of the class attribute', () => {
    expect(
      parseMarkdown('<span class=\'token x" onmouseover="alert(1)\'>x</span>'),
    ).toBe('<p><span class="token">x</span></p>\n');
    // The trailing `"` makes this no longer a valid `language-*` token, so the
    // pattern branch cannot be used to smuggle the quote back in either.
    expect(
      parseMarkdown(
        '<span class=\'language-js" onmouseover="alert(1)\'>x</span>',
      ),
    ).toBe('<p><span>x</span></p>\n');
  });
});

// ---------------------------------------------------------------------------
// Regression battery pinned from the 2026-07-06 sanitizer alignment design
// note (§Safety / "Verified payload battery"). Widening the allowlist must not
// change any of these outputs.
// ---------------------------------------------------------------------------
describe('parseMarkdown: XSS payload battery', () => {
  it.each([
    ['event handler on img', '<img src=x onerror=alert(1)>', '<img src>'],
    ['event handler on div', '<div onclick="alert(1)">x</div>', '<div>x</div>'],
    [
      'event handler on details',
      '<details ontoggle="alert(1)"><summary>s</summary>b</details>',
      '<details><summary>s</summary>b</details>',
    ],
    [
      'javascript: href',
      '<a href="javascript:alert(1)">x</a>',
      '<p><a href>x</a></p>\n',
    ],
    [
      'javascript: href, mixed case',
      '<a href="JaVaScRiPt:alert(1)">x</a>',
      '<p><a href>x</a></p>\n',
    ],
    [
      'javascript: href, entity encoded',
      '<a href="&#106;avascript:alert(1)">x</a>',
      '<p><a href>x</a></p>\n',
    ],
    [
      'javascript: href, embedded tab',
      '<a href="java\tscript:alert(1)">x</a>',
      '<p><a href>x</a></p>\n',
    ],
    [
      'javascript: href, leading space',
      '<a href=" javascript:alert(1)">x</a>',
      '<p><a href>x</a></p>\n',
    ],
    [
      'data: href',
      '<a href="data:text/html,<script>alert(1)</script>">x</a>',
      '<p><a href>x</a></p>\n',
    ],
    [
      'vbscript: href',
      '<a href="vbscript:msgbox(1)">x</a>',
      '<p><a href>x</a></p>\n',
    ],
    ['script tag', '<script>alert(1)</script>', ''],
    ['iframe', '<iframe src="https://evil.example"></iframe>', ''],
    ['svg onload', '<svg onload="alert(1)"><circle /></svg>', '<p></p>\n'],
    ['math', '<math><mtext>x</mtext></math>', '<p></p>\n'],
    ['object', '<object data="x.swf"></object>', '<p></p>\n'],
    ['embed', '<embed src="x.swf">', ''],
    ['base', '<base href="https://evil.example/">', ''],
    [
      'style attribute',
      '<p style="background:url(javascript:alert(1))">x</p>',
      '<p>x</p>',
    ],
    [
      'attribute breakout',
      '"><img src=x onerror=alert(1)>',
      '<p>&quot;&gt;<img src></p>\n',
    ],
  ])('neutralises %s', (_name, payload, expected) => {
    expect(parseMarkdown(payload)).toBe(expected);
  });

  // The battery above only ever fed the sanitizer *raw HTML*. These payloads
  // reach it through plain Markdown link syntax instead: `renderer.link`
  // interpolates the destination and the title straight into the `<a>` tag it
  // builds, so a `"` in either one closes that attribute and opens another.
  // js-xss re-parses the result and strips `on*`, so there is no script
  // execution — but every *allowlisted* attribute (`id`, `name`, `title`,
  // `aria-*`, `align`, …) is injectable with no raw HTML involved, and
  // `id="user-content-fn-1"` in particular steals a footnote's scroll target
  // and hands out a DOM-clobbering primitive. Bracketed (`<…>`) destinations
  // and backslash-escaped quotes in a title are both plain CommonMark.
  it.each([
    [
      'a quote in a `#` link destination',
      '[x](<#a" id="pwn>)',
      '<p><a href="#a&quot; id=&quot;pwn">x</a></p>\n',
    ],
    [
      'a quote in an external link destination',
      '[x](<https://e.com" id="pwn>)',
      '<p><a href="https://e.com&quot; id=&quot;pwn" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    ],
    [
      'a quote in a link title',
      '[x](#a "t\\" id=\\"pwn")',
      '<p><a href="#a" title="t&quot; id=&quot;pwn">x</a></p>\n',
    ],
    [
      'a quote in a relative link destination joined with baseUrl',
      '[x](<./y" id="pwn>)',
      '<p><a href="/y&quot; id=&quot;pwn" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    ],
  ])('neutralises %s', (_name, payload, expected) => {
    expect(parseMarkdown(payload)).toBe(expected);
  });

  // The concrete harm behind the payloads above: an author-controlled `id` on
  // an arbitrary element. Asserted separately from the byte-exact strings so
  // the property survives any future change to how the value is escaped.
  it.each([
    ['`#` destination', '[x](<#a" id="user-content-fn-1>)'],
    ['external destination', '[x](<https://e.com" id="user-content-fn-1>)'],
    ['title', '[x](#a "t\\" id=\\"user-content-fn-1")'],
  ])('cannot forge an id from a link %s', (_name, payload) => {
    expect(parseMarkdown(payload)).not.toMatch(/\sid="user-content-fn-1"/);
  });
});

// ---------------------------------------------------------------------------
// Heading anchors (`marked-gfm-heading-id`) and `#`-prefixed link rendering,
// see docs/superpowers/specs/2026-07-31-markdown-gfm-extensions-design.md
// (问题 4/5, 设计决策 6/7, §标题锚点 / §链接渲染).
// ---------------------------------------------------------------------------
describe('parseMarkdown: heading anchors', () => {
  // The task's goal sentence, verbatim.
  it('gives a heading an id and keeps a `#` link to it working in-page', () => {
    expect(parseMarkdown('## 安装\n\n[跳转](#安装)')).toBe(
      '<h2 id="安装">安装</h2>\n' + '<p><a href="#安装">跳转</a></p>\n',
    );
  });

  it('slugs are lowercased, strip punctuation, and turn spaces into hyphens', () => {
    expect(parseMarkdown('## Hello, World!')).toBe(
      '<h2 id="hello-world">Hello, World!</h2>\n',
    );
  });

  it('preserves CJK characters in the slug', () => {
    expect(parseMarkdown('## 安装说明')).toBe(
      '<h2 id="安装说明">安装说明</h2>\n',
    );
  });

  it('dedupes repeated headings within a single parse with -1, -2, …', () => {
    expect(parseMarkdown('## Foo\n\n## Foo\n\n## Foo')).toBe(
      '<h2 id="foo">Foo</h2>\n' +
        '<h2 id="foo-1">Foo</h2>\n' +
        '<h2 id="foo-2">Foo</h2>\n',
    );
  });

  // Dedupe is scoped to one document: two independent parses must not see each
  // other's headings. (`marked-gfm-heading-id` keeps its slugger in module
  // scope and resets it from a `preprocess` hook on every parse, so this holds
  // whether or not the `Marked` instance is shared — the test pins the
  // observable contract, not the mechanism.)
  it('does not leak dedupe state between two separate parseMarkdown calls', () => {
    expect(parseMarkdown('## 安装')).toBe('<h2 id="安装">安装</h2>\n');
    expect(parseMarkdown('## 安装')).toBe('<h2 id="安装">安装</h2>\n');
  });

  it('assigns an id to every heading level h1 through h6', () => {
    expect(parseMarkdown('# a\n## b\n### c\n#### d\n##### e\n###### f')).toBe(
      '<h1 id="a">a</h1>\n' +
        '<h2 id="b">b</h2>\n' +
        '<h3 id="c">c</h3>\n' +
        '<h4 id="d">d</h4>\n' +
        '<h5 id="e">e</h5>\n' +
        '<h6 id="f">f</h6>\n',
    );
  });

  // A README heading that is only a badge/logo image (or an empty `##`) slugs
  // to the empty string, and `marked-gfm-heading-id` still emits `id=""` for
  // it. An empty id is invalid HTML (the attribute must hold at least one
  // character) and can never be an anchor target, so the attribute is dropped
  // rather than emitted bare — the heading renders exactly as it did before
  // heading ids existed.
  it('omits the id when a heading slugs to nothing', () => {
    expect(parseMarkdown('## ![logo](./logo.png)')).toBe(
      '<h2><img src="./logo.png" alt="logo"></h2>\n',
    );
    expect(parseMarkdown('##')).toBe('<h2></h2>\n');
  });

  // Same rule, reached from raw HTML rather than from a heading: `id` is
  // allowed on every element, and an author-written `id=""` is equally
  // pointless.
  it('drops an empty id written in raw HTML', () => {
    expect(parseMarkdown('<div id="">x</div>')).toBe('<div>x</div>');
  });

  // Same rule again, for the spellings of "blank" that are not the empty
  // string. js-xss trims a raw attribute value before `onTagAttr` sees it — so
  // the literal tab and the spaces below were already dropped — but it decodes
  // entities only afterwards, in `friendlyAttrValue`, which turns control
  // characters into spaces and trims. `id="&#9;"` therefore used to pass the
  // emptiness check and come out as the bare `<div id>` that check exists to
  // prevent. All three are pinned so the fix cannot regress into handling only
  // the spelling that happened to be reported.
  it.each([
    ['an entity-encoded tab', '<div id="&#9;">x</div>'],
    ['a literal tab', '<div id="\t">x</div>'],
    ['spaces', '<div id="  ">x</div>'],
  ])('drops an id that is only %s', (_name, source) => {
    expect(parseMarkdown(source)).toBe('<div>x</div>');
  });

  // Design decision 6: the slug carries no `user-content-` prefix, precisely
  // so a legacy `<a name="…">` anchor (e.g. copied verbatim from a README)
  // keeps working side by side with the new heading ids.
  it('keeps a legacy `<a name>` anchor and a `#` link to it both working', () => {
    expect(parseMarkdown('<a name="foo"></a>\n\n[x](#foo)')).toBe(
      '<p><a name="foo"></a></p>\n' + '<p><a href="#foo">x</a></p>\n',
    );
  });

  // -------------------------------------------------------------------------
  // The slug is interpolated straight into `id="…"` by `marked-gfm-heading-id`
  // (`<h${depth} id="${id}">…`, node_modules/marked-gfm-heading-id/src/index.js)
  // with no escaping, and this pipeline deliberately adds none of its own: the
  // extension owns that concatenation, and marked's `use()` chain cannot
  // post-process another extension's rendered output — a later
  // `renderer.heading` replaces it rather than wrapping it, so "escape it at
  // our layer" would mean reimplementing the extension and its slugger rather
  // than using them. Three things keep it safe instead, verified by neutering
  // `github-slugger` locally and watching these tests go red:
  //
  //  1. marked escapes the heading text, and the extension slugs
  //     `unescape(text)` — an `unescape` that *deletes* named entities. So a
  //     literally typed `"` (→ `&quot;` → deleted) never reaches the slug at
  //     all, whatever the slugger does.
  //  2. A *numeric* entity is the case that does reach it: marked leaves
  //     `&#34;` alone and that same `unescape` turns it back into a raw `"`.
  //     Here `github-slugger`'s stripping is the only thing standing between
  //     the document and a split attribute — layer 1 in the real sense.
  //  3. The sanitizer re-parses the result, so an attribute that did get
  //     injected is still filtered by the allowlist.
  //
  // Layer 3 is why this is "safe today, pin it" and not a live bug: `onclick`
  // would not survive. What it does not cover is an *allowlisted* attribute —
  // a stolen `id` (hijacking a footnote's scroll target) or a forged `title` —
  // which is exactly the attribute-injection class this branch closed on link
  // hrefs/titles and on footnote labels. With the slugger neutered both do
  // reach the output, so the tests below are what turns a dependency change
  // into a red test instead of a silent regression.
  // -------------------------------------------------------------------------
  it.each([
    // Typed literally: never reaches the slug (layer 1).
    [
      'a double quote',
      '## a" id="user-content-fn-1',
      '<h2 id="a-iduser-content-fn-1">a&quot; id=&quot;user-content-fn-1</h2>\n',
    ],
    ['angle brackets', '## a<b>c', '<h2 id="ac">a<b>c</h2>\n'],
    ['a backtick', '## a`b`c', '<h2 id="abc">a<code>b</code>c</h2>\n'],
    ['a run of spaces', '## a   b', '<h2 id="a---b">a   b</h2>\n'],
    // Written as a numeric entity: decoded back to the raw character before
    // slugging, so these are the cases `github-slugger` itself has to handle.
    [
      'a decimal-entity double quote',
      '## a&#34; id=&#34;user-content-fn-1',
      '<h2 id="a-iduser-content-fn-1">a&#34; id=&#34;user-content-fn-1</h2>\n',
    ],
    [
      'a hex-entity double quote',
      '## a&#x22; onclick=&#x22;alert(1)',
      '<h2 id="a-onclickalert1">a&#x22; onclick=&#x22;alert(1)</h2>\n',
    ],
    [
      'an entity single quote',
      '## a&#39; id=&#39;x',
      '<h2 id="a-idx">a&#39; id=&#39;x</h2>\n',
    ],
    ['an entity newline', '## a&#10;b', '<h2 id="ab">a&#10;b</h2>\n'],
  ])('keeps %s out of the heading id', (_name, markdown, expected) => {
    expect(parseMarkdown(markdown)).toBe(expected);
  });

  it.each([
    ['stealing a footnote item id', '## a&#34; id=&#34;user-content-fn-1'],
    [
      'stealing a footnote item id past a space',
      '## a&#34;&#32;id=&#34;user-content-fn-1',
    ],
    [
      'stealing the footnotes heading id',
      '## a&#34; id=&#34;user-content-fn-label',
    ],
    // `title` is allowlisted, so the sanitizer would not strip this one.
    ['forging a title', '## a&#34; title=&#34;stolen'],
    ['adding an event handler', '## a&#x22; onclick=&#x22;alert(1)'],
    ['adding an unquoted attribute', '## a id=user-content-fn-1'],
  ])(
    'cannot add a second attribute to the heading tag through the slug (%s)',
    (_name, markdown) => {
      const html = parseMarkdown(markdown);

      // One attribute, whose value holds neither a quote nor whitespace — the
      // two ways out of the `id="…"` the extension builds.
      expect(/<h2[^>]*>/.exec(html)?.[0]).toMatch(/^<h2 id="[^"\s]*">$/);
      expect(html).not.toMatch(/\sid="user-content-fn-(1|label)"/);
      expect(html).not.toMatch(/<h2[^>]*\stitle=/);
    },
  );

  // Layer 3, reached directly: an `id` that survives sanitization on a heading
  // written as raw HTML, next to a handler that does not.
  it('drops a non-allowlisted attribute from a raw-HTML heading, keeping its id', () => {
    expect(parseMarkdown('<h2 id="a" onclick="alert(1)">x</h2>')).toBe(
      '<h2 id="a">x</h2>',
    );
  });
});

describe('parseMarkdown: `#` link rendering', () => {
  it('emits a `#` href as-is: no baseUrl join, no target="_blank", no rel', () => {
    expect(parseMarkdown('[跳转](#安装)')).toBe(
      '<p><a href="#安装">跳转</a></p>\n',
    );
  });

  it('does not join a `#` href with baseUrl', () => {
    expect(parseMarkdown('[跳转](#安装)', '/zh-CN/scripts/123')).toBe(
      '<p><a href="#安装">跳转</a></p>\n',
    );
  });

  it('does not join a `#` href with resourceBase either', () => {
    expect(
      parseMarkdown('[跳转](#安装)', '/zh-CN/scripts/123', {
        base: 'https://raw.githubusercontent.com/foo/bar/main/',
      }),
    ).toBe('<p><a href="#安装">跳转</a></p>\n');
  });

  it('keeps a title on a `#` link', () => {
    expect(parseMarkdown('[x](#安装 "a title")')).toBe(
      '<p><a href="#安装" title="a title">x</a></p>\n',
    );
  });
});

// Pins every other link shape byte-identical across the three argument
// shapes this codebase actually calls `parseMarkdown` with (see callers of
// `parseMarkdown` in MarkdownView/index.tsx, MarkdownEditor/index.tsx, and
// the chat page): no baseUrl/resourceBase, baseUrl only, and baseUrl +
// resourceBase. None of these are `#` links, so decision 7 must not move
// any of them.
describe('parseMarkdown: non-`#` links are unchanged', () => {
  it('external links keep target="_blank" and rel, in every argument shape', () => {
    const expected =
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n';
    expect(parseMarkdown('[x](https://example.com)')).toBe(expected);
    expect(
      parseMarkdown('[x](https://example.com)', '/zh-CN/scripts/123'),
    ).toBe(expected);
    expect(
      parseMarkdown('[x](https://example.com)', '/zh-CN/scripts/123', {
        base: 'https://raw.githubusercontent.com/foo/bar/main/',
      }),
    ).toBe(expected);
  });

  it('keeps title + target + rel together on an external link', () => {
    expect(parseMarkdown('[x](https://example.com "a title")')).toBe(
      '<p><a href="https://example.com" title="a title" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  it('a document-relative `./x` link resolves against baseUrl (no resourceBase)', () => {
    expect(parseMarkdown('[x](./y.md)', '/zh-CN/scripts/123')).toBe(
      '<p><a href="/zh-CN/scripts/123/y.md" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  it('a document-relative `./x` link resolves against resourceBase.base when supplied', () => {
    expect(
      parseMarkdown('[x](./y.md)', '/zh-CN/scripts/123', {
        base: 'https://raw.githubusercontent.com/foo/bar/main/',
      }),
    ).toBe(
      '<p><a href="https://raw.githubusercontent.com/foo/bar/main/y.md" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  it('a root-relative `/x` link resolves against resourceBase.root when supplied', () => {
    expect(
      parseMarkdown('[x](/y.md)', '/zh-CN/scripts/123', {
        base: 'https://raw.githubusercontent.com/foo/bar/main/',
        root: 'https://github.com/foo/bar/tree/main/',
      }),
    ).toBe(
      '<p><a href="https://github.com/foo/bar/tree/main/y.md" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  it('a root-relative `/x` link joins baseUrl when there is no resourceBase', () => {
    expect(parseMarkdown('[x](/y.md)', '/zh-CN/scripts/123')).toBe(
      '<p><a href="/zh-CN/scripts/123/y.md" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  it('a bare relative `x` link is treated like a root-relative link against baseUrl', () => {
    expect(parseMarkdown('[x](y.md)')).toBe(
      '<p><a href="/y.md" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
    expect(parseMarkdown('[x](y.md)', '/zh-CN/scripts/123')).toBe(
      '<p><a href="/zh-CN/scripts/123/y.md" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  // Pre-existing quirk, pinned rather than "fixed": with a resourceBase, a
  // bare relative href (no leading `./`) is left untouched by the renderer
  // (resolution happens once in safeAttrValue) and js-xss's own default
  // `safeAttrValue` blanks a URL with no recognized prefix (no scheme, no
  // leading `/`, `./`, or `#`) before `absolutizeUrl` ever runs — so the
  // `href` attribute survives empty. This is unrelated to the `#` change in
  // this task; it is pinned so a future change doesn't silently move it.
  it('a bare relative `x` link with resourceBase but no leading `./` renders with an empty href', () => {
    expect(
      parseMarkdown('[x](y.md)', '/zh-CN/scripts/123', {
        base: 'https://raw.githubusercontent.com/foo/bar/main/',
      }),
    ).toBe(
      '<p><a href target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  it('a `?query` link resolves against baseUrl', () => {
    expect(parseMarkdown('[x](?foo=1)', '/zh-CN/scripts/123')).toBe(
      '<p><a href="/zh-CN/scripts/123?foo=1" target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });

  // Same pre-existing quirk as the bare relative link above, reached from the
  // other side: with no baseUrl to join, js-xss's default `safeAttrValue`
  // blanks a `?query` href (no scheme and no `/`, `./` or `#` prefix) and the
  // attribute survives empty. Pinned, not fixed — unrelated to this task.
  it('a `?query` link with no baseUrl renders with an empty href', () => {
    expect(parseMarkdown('[x](?foo=1)')).toBe(
      '<p><a href target="_blank" rel="noopener noreferrer nofollow">x</a></p>\n',
    );
  });
});
