'use client';

import { useLocale, useTranslations } from 'next-intl';
import { parseMarkdown } from './parseMarkdown';
import type { MarkdownLabels, ResourceBase } from './parseMarkdown';

/**
 * The `components.markdown` message keys this module reads. Narrower than
 * `next-intl`'s translator on purpose: it is what `useTranslations` returns
 * that has to satisfy this, not the other way round, so the parameter type
 * stays a subset of the namespace's real keys.
 */
type MarkdownMessageKey =
  | 'note'
  | 'tip'
  | 'important'
  | 'warning'
  | 'caution'
  | 'footnotes_heading'
  | 'footnote_backref';

/** The slice of a `next-intl` translator `buildMarkdownLabels` needs. */
export interface MarkdownTranslator {
  (key: MarkdownMessageKey): string;
  raw(key: MarkdownMessageKey): string;
}

/**
 * The single source of truth for which `components.markdown` messages the
 * Markdown pipeline reads and where each one lands in `MarkdownLabels`.
 *
 * Kept out of the hook so it can be tested without a React renderer — the key
 * list is not duplicated in the test, the test records it from here (see
 * useMarkdownParser.test.ts).
 */
export function buildMarkdownLabels(t: MarkdownTranslator): MarkdownLabels {
  return {
    note: t('note'),
    tip: t('tip'),
    important: t('important'),
    warning: t('warning'),
    caution: t('caution'),
    footnotesHeading: t('footnotes_heading'),
    // `.raw()`, not `t()`: this string's `{0}` is a literal token that
    // `marked-footnote` substitutes itself (see MarkdownLabels.footnoteBackref
    // in parseMarkdown.ts), not an ICU interpolation `t()` would try to
    // resolve — and fail on, since no value is ever passed for it here.
    footnoteBackref: t.raw('footnote_backref'),
  };
}

/** What `useMarkdownParser` returns: `parseMarkdown` with the labels bound in. */
export type BoundMarkdownParser = (
  content: string,
  baseUrl?: string,
  resourceBase?: ResourceBase,
) => string;

/**
 * One bound parser per locale, cached for the lifetime of the module.
 *
 * The cache key is the *locale*, not the translator, because the translator is
 * not stable: `next-intl` memoizes `t` on the identity of the messages object
 * its context holds, and any RSC re-render — `router.refresh()`, which
 * ScriptLayout does after routine user actions — hands
 * `NextIntlClientProvider` a fresh one. Deriving the parser from `t` therefore
 * produced a new parser on every refresh, which invalidated `MarkdownView`'s
 * `useMemo` and re-parsed the whole script description for nothing. React's own
 * `useMemo`/`useCallback` keyed on the locale would fix that only per component
 * instance and only as long as React keeps the cache; this map makes the
 * identity a property of the locale itself, which is what the labels actually
 * depend on. It is also plain enough to unit-test without a React renderer (see
 * useMarkdownParser.test.ts).
 *
 * Bounded by the number of routing locales (6: the keys of `languageMap` in
 * `src/i18n/routing.ts` — `en`, `zh-CN`, `zh-TW`, `ru`, `ja`, `de`), because
 * `useLocale()` only ever returns one of those short keys. A full tag like
 * `vi-VN` is never a cache key here, even though `public/locales/vi-VN` ships
 * as a translation pack — `vi` is not in `languageMap`, so routing never
 * produces it.
 *
 * Safe to share across requests on the server as long as `components` stays in
 * the root layout's namespace list: `LocalizedServerThemeWrapper.tsx`'s
 * `pickMessages(messages, [...])` call, which every locale's `NextIntlClientProvider`
 * is built from. (`PageIntlProvider`'s own `BASE_NAMESPACES` is not what
 * governs this — it only re-lists the same namespaces so its *nested*
 * provider, layered on top of the root one for a handful of pages, doesn't
 * drop them; most pages, including the ones that render Markdown, never go
 * through it at all.) If `components` were ever dropped from the root list,
 * this cache turns what would otherwise be one request's missing-namespace
 * bug into every request on that server process rendering, e.g.,
 * `components.markdown.note` as a literal alert title for that locale until
 * the process restarts. The one cost with `components` correctly listed is
 * that editing `public/locales/<locale>/translations.json` in dev only shows
 * up after the module reloads.
 */
const parsersByLocale = new Map<string, BoundMarkdownParser>();

export function markdownParserFor(
  locale: string,
  t: MarkdownTranslator,
): BoundMarkdownParser {
  const cached = parsersByLocale.get(locale);
  if (cached) {
    return cached;
  }
  const labels = buildMarkdownLabels(t);
  const parser: BoundMarkdownParser = (content, baseUrl, resourceBase) =>
    parseMarkdown(content, baseUrl, resourceBase, labels);
  parsersByLocale.set(locale, parser);
  return parser;
}

/**
 * Single entry point for turning Markdown into sanitized HTML with the site's
 * localized alert/footnote labels bound in.
 *
 * `parseMarkdown` itself stays a labels-optional pure function (English
 * default) so it can be unit-tested without an i18n context — this hook is
 * what every React call site (script detail page, editor preview, chat) uses
 * instead, so the three of them cannot drift into showing different
 * languages for the same Markdown. See
 * docs/superpowers/specs/2026-07-31-markdown-gfm-extensions-design.md §编辑器
 * (the editor takes its labels from this same entry point) — and its pointer to
 * §已知限制, which records that the Toast UI *preview tab* does not go through
 * this pipeline at all, contrary to what code comments long assumed. That gap
 * is accepted this round, not closed by this hook.
 */
export function useMarkdownParser(): BoundMarkdownParser {
  // The returned parser changes identity when — and only when — the locale
  // does, so a call site can safely put it in a `useMemo` dependency array
  // (MarkdownView does) or hold it for the life of an editor instance
  // (MarkdownEditor does).
  const locale = useLocale();
  const t = useTranslations('components.markdown');

  return markdownParserFor(locale, t);
}
