import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './parseMarkdown';
import { buildMarkdownLabels, markdownParserFor } from './useMarkdownParser';
import type { MarkdownTranslator } from './useMarkdownParser';

// ---------------------------------------------------------------------------
// What this file reaches, and what it deliberately does not.
//
// `useMarkdownParser` is a React hook and this repo has no React testing
// library (adding one is out of scope). So everything about the hook that is
// not React lives in two plain functions, and those are what is exercised here:
//
//   - `buildMarkdownLabels` — which `components.markdown` messages are read,
//     whether each goes through `t()` or `t.raw()`, and which `MarkdownLabels`
//     field it lands in;
//   - `markdownParserFor` — the returned parser's *identity*, i.e. that it
//     survives a replaced `next-intl` context and changes only with the locale.
//
// The identity behaviour used to sit in a `useMemo`/`useCallback` keyed on the
// translator, where it was both wrong (a `router.refresh()` re-parsed every
// description) and out of reach without a renderer. Keying it on the locale in
// a plain map fixed the first and removed the excuse for the second.
//
// What is left in the hook is two `next-intl` reads and a call, and that alone
// still needs a renderer.
//
// The locale checks below take their key list from `buildMarkdownLabels`
// itself rather than from a hand-copied duplicate. Rename `footnotes_heading`
// in the hook and they fail here, instead of every locale silently rendering
// the literal string `components.markdown.footnotes_title` as the footnotes
// heading.
// ---------------------------------------------------------------------------

/**
 * A `t` that records which keys were read and echoes each call back as its
 * value, so an assertion on the returned object shows both the key and whether
 * it came through `t()` or `t.raw()`.
 *
 * Only the set of keys is recorded, not the order they were read in: that is
 * the order of the fields in `buildMarkdownLabels`'s object literal, which no
 * caller can observe. A test on it went red when two fields were swapped with
 * nothing else changing — verified — while the two behaviours it looked like
 * it was protecting (each key landing on the right field, `footnote_backref`
 * going through `.raw()`) are both asserted below, and both were verified to go
 * red on a mutation that actually breaks them.
 */
function recordingTranslator(): {
  t: MarkdownTranslator;
  reads: string[];
} {
  const reads: string[] = [];
  const t = ((key: string) => {
    reads.push(key);
    return `t(${key})`;
  }) as MarkdownTranslator;
  t.raw = (key: string) => {
    reads.push(key);
    return `t.raw(${key})`;
  };
  return { t, reads };
}

describe('buildMarkdownLabels', () => {
  // The `t(…)` / `t.raw(…)` in the expected values is the routing assertion:
  // `footnote_backref` has to come through `.raw()`, because the `{0}` in it is
  // a literal token `marked-footnote` substitutes itself, not an ICU
  // placeholder — `t()` would try to resolve it and fail, since nothing ever
  // passes a value for it.
  it('lands each message on the MarkdownLabels field parseMarkdown expects', () => {
    const { t } = recordingTranslator();

    expect(buildMarkdownLabels(t)).toEqual({
      note: 't(note)',
      tip: 't(tip)',
      important: 't(important)',
      warning: 't(warning)',
      caution: 't(caution)',
      footnotesHeading: 't(footnotes_heading)',
      footnoteBackref: 't.raw(footnote_backref)',
    });
  });

  // The field names are checked by the compiler; that the *values* are not
  // crossed over (a `caution` title showing up on the warning alert) is not.
  it('carries each message through parseMarkdown to the element it titles', () => {
    const { t } = recordingTranslator();

    const html = parseMarkdown(
      '> [!WARNING]\n> body\n\ntext[^1]\n\n[^1]: note',
      '',
      undefined,
      buildMarkdownLabels(t),
    );

    expect(html).toContain('<p class="markdown-alert-title">t(warning)</p>');
    expect(html).toContain(
      '<h2 id="user-content-fn-label">t(footnotes_heading)</h2>',
    );
    expect(html).toContain('aria-label="t.raw(footnote_backref)"');
  });
});

// ---------------------------------------------------------------------------
// Parser identity. The whole point of keying on the locale rather than on the
// translator: `next-intl` memoizes `t` on the *identity* of the messages object
// its context holds, and every `router.refresh()` (ScriptLayout does one after
// routine actions) hands `NextIntlClientProvider` a fresh one. A parser rebuilt
// from that is a new function, which invalidates `MarkdownView`'s `useMemo` and
// re-parses the whole description on an ordinary refresh, and would rebuild the
// live Toast UI editor under the user's caret.
// ---------------------------------------------------------------------------
describe('markdownParserFor', () => {
  it('hands back the same parser when the intl context replaces the translator', () => {
    // 'en', not 'en-US': this is the cache key `useLocale()` actually hands
    // `markdownParserFor` in the app (a routing key from `languageMap` in
    // `src/i18n/routing.ts`), not the full locale tag used elsewhere for
    // translation-pack filenames.
    const first = markdownParserFor('en', recordingTranslator().t);
    const second = markdownParserFor('en', recordingTranslator().t);

    expect(second).toBe(first);
  });

  it('builds a separate parser per locale, each on that locale’s labels', () => {
    const document = 'text[^1]\n\n[^1]: note';
    const en = markdownParserFor('en-parser', localeTranslator('en-US'));
    const zh = markdownParserFor('zh-parser', localeTranslator('zh-CN'));

    expect(zh).not.toBe(en);
    expect(en(document)).toContain(
      '<h2 id="user-content-fn-label">Footnotes</h2>',
    );
    expect(zh(document)).toContain('<h2 id="user-content-fn-label">脚注</h2>');
  });
});

// ---------------------------------------------------------------------------
// The message keys the hook actually reads, recorded from the hook's own
// source of truth — not restated. Everything below checks the locale packs
// against this.
// ---------------------------------------------------------------------------
const REQUIRED_KEYS = (() => {
  const { t, reads } = recordingTranslator();
  buildMarkdownLabels(t);
  return reads;
})();

// Every locale pack, including `vi-VN`, which ships translations even though
// `src/i18n/routing.ts` does not currently route to it.
const LOCALES = [
  'zh-CN',
  'zh-TW',
  'en-US',
  'ja-JP',
  'ru-RU',
  'de-DE',
  'vi-VN',
] as const;

const localesDir = fileURLToPath(
  new URL('../../../public/locales', import.meta.url),
);

function markdownNamespace(locale: string): Record<string, unknown> {
  const raw = readFileSync(
    `${localesDir}/${locale}/translations.json`,
    'utf-8',
  );
  const messages = JSON.parse(raw) as {
    components?: { markdown?: Record<string, unknown> };
  };
  const namespace = messages.components?.markdown;
  expect(namespace, `${locale} is missing components.markdown`).toBeTypeOf(
    'object',
  );
  return namespace as Record<string, unknown>;
}

/** A `t` backed by a real locale pack, so the hook can be run against it. */
function localeTranslator(locale: string): MarkdownTranslator {
  const namespace = markdownNamespace(locale);
  const t = ((key: string) => namespace[key] as string) as MarkdownTranslator;
  t.raw = (key: string) => namespace[key] as string;
  return t;
}

describe('components.markdown translations', () => {
  // A key missing from one locale does not throw — `next-intl` falls back to
  // rendering the key path — so an alert would silently be titled
  // "components.markdown.important" instead of 「重要」. These files are edited
  // by hand (there is no Crowdin sync), which is exactly how one locale drifts.
  it.each(LOCALES)('%s carries exactly the keys the hook reads', (locale) => {
    const namespace = markdownNamespace(locale);

    expect(Object.keys(namespace).sort()).toEqual([...REQUIRED_KEYS].sort());
  });

  it.each(LOCALES)('%s maps every label to a plain string', (locale) => {
    const namespace = markdownNamespace(locale);

    for (const key of REQUIRED_KEYS) {
      // A nested object here reaches `parseMarkdown` as a non-string. That no
      // longer throws (see its `withDefaultLabels`), but it degrades to the
      // built-in English label, i.e. this locale silently renders one label in
      // the wrong language — which is what this check is for.
      expect(namespace[key], `${locale}.${key}`).toBeTypeOf('string');
      expect((namespace[key] as string).trim(), `${locale}.${key}`).not.toBe(
        '',
      );
    }
  });

  it.each(LOCALES)(
    '%s keeps the literal {0} token in the back-reference',
    (locale) => {
      const namespace = markdownNamespace(locale);

      // `{0}` is substituted by `marked-footnote` with the footnote's own
      // label, which is why the hook reads this one with `t.raw()`. A locale
      // dropping or translating the token loses the footnote number from the
      // `aria-label`.
      expect(namespace.footnote_backref).toContain('{0}');
    },
  );

  // The parser's built-in English fallback and the en-US pack must not drift,
  // or the same document renders differently depending on whether the caller
  // went through the hook. Compared by rendering rather than by restating the
  // English strings here, so this stays a check on the two sources of labels
  // and not a third copy of them.
  it('renders identically through the en-US pack and through parseMarkdown’s built-in default', () => {
    const document =
      '> [!NOTE]\n> n\n\n> [!TIP]\n> t\n\n> [!IMPORTANT]\n> i\n\n' +
      '> [!WARNING]\n> w\n\n> [!CAUTION]\n> c\n\ntext[^1]\n\n[^1]: note';

    expect(
      parseMarkdown(
        document,
        '',
        undefined,
        buildMarkdownLabels(localeTranslator('en-US')),
      ),
    ).toBe(parseMarkdown(document));
  });
});
