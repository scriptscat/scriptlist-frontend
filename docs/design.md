# Design system

Next.js App Router + React 19 + Ant Design + Tailwind CSS 4 + next-intl, in **light and
dark** across **7 locales** (`public/locales/*/translations.json`). Both themes and every
locale ship, so both have to work in anything you add.

Enforcement and commands belong to [`../AGENTS.md`](../AGENTS.md); this file owns tokens,
themes, async states and accessibility.

## Core constraints

- **Colours come from the CSS variables in `src/app/globals.css`** — `:root` for light,
  `[data-theme="dark"]` for dark. Consume them through the `.bg-app-*` / `.text-app-*` /
  `.border-app-*` helper classes in the same file, or as `rgb(var(--token))` inside a
  Tailwind arbitrary value (`text-[rgb(var(--text-tertiary))]`).
- **Ant Design reads the same palette through `src/lib/antd-theme.ts`**, which restates
  the values as literal hex. It is the second half of one decision: a token that changes
  in `globals.css` and not there leaves antd components on the old colour.
- `dark:` is bound to the `data-theme` attribute, not to the media query —
  `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`
  (`globals.css:3`). A component styled for `prefers-color-scheme` will not follow the
  theme toggle.
- Reach for an Ant Design component before writing one. In server-reachable modules import
  it by deep path; [`../AGENTS.md`](../AGENTS.md) owns why and the guard test that enforces it.
- Cover loading, empty, error and success for every async flow, at the region that
  changed rather than the whole page.
- Visible static copy goes through `useTranslations()` / `getTranslations()`, never a
  literal (`react/jsx-no-literals` warns). `pnpm check:i18n` compares the locale bundles.

## Theme and tokens

`src/app/globals.css` is the only place a colour value is declared.

| Variable | Light | Dark | Meaning |
|---|---|---|---|
| `--bg-primary` | `246 248 250` | `13 17 23` | page background |
| `--bg-secondary` | `240 243 246` | `22 27 34` | second-level surface |
| `--bg-tertiary` | `233 238 244` | `33 38 45` | third-level surface |
| `--bg-elevated` | `255 255 255` | `22 27 34` | card surface |
| `--text-primary` | `36 41 47` | `248 248 242` | body text |
| `--text-secondary` | `87 96 106` | `139 148 158` | secondary text |
| `--text-tertiary` | `139 148 158` | `110 118 129` | third text level |
| `--text-inverse` | `255 255 255` | `13 17 23` | text on an inverted surface |
| `--border-primary` | `208 215 222` | `48 54 61` | standard border |
| `--border-secondary` | `216 222 228` | `33 38 45` | hairline border |
| `--border-focus` | `13 110 253` | `88 166 255` | focus ring |
| `--primary-500` | `13 110 253` | `88 166 255` | brand |
| `--primary-600` / `--primary-700` | `11 94 215` / `10 82 190` | `79 149 229` / `65 132 228` | brand, pressed and deep |

Values are space-separated RGB channels so they compose with an alpha:
`rgb(var(--primary-500) / 0.08)`.

Typography, radius and shadow live in `src/lib/antd-theme.ts`: `Geist` at 14px,
`borderRadius` 8 with `LG` 12 / `SM` 6 / `XS` 4.

**How the theme reaches the page.** `LocalizedServerThemeWrapper` reads the theme cookie
on the server and renders `data-theme` onto `<html>` (`:59`), so the first byte already
carries the right theme. In `auto` mode a blocking inline script re-reads
`prefers-color-scheme` before paint (`:72`) — that script is what prevents the flash, and
it must stay inline and synchronous. After hydration `ThemeClientContext` subscribes to
the media query through `useSyncExternalStore`, which is what keeps the server snapshot
and the client value from disagreeing. antd's `cssVar` keys are fixed constants shared
between prebuild and runtime (`antd-theme.ts:6-11`); changing one without the other
breaks the generated class names.

**There is no Tailwind theme config.** Tailwind 4 loads a JS config only through an
explicit `@config`, and `globals.css` has none — a `tailwind.config.ts` holding a second
GitHub-style palette sat unloaded in this repo and was deleted. The consequence is still
live: `neutral-*`, `slate-*` and friends resolve to **Tailwind's stock palette**, not to
the tokens above. Prefer an `app-*` helper or a `rgb(var(--token))` arbitrary value for
anything that has to follow the theme.

Fourteen raw colour classes remain (`text-[#1677ff]` ×5, `text-[#3388FF]` ×2,
`bg-[#2d333b]`, `border-[#484f58]` and others). They are debt, not a pattern; do not add
more.

## Layout and motion

- **Shell.** `src/app/[locale]/layout.tsx` → `LocalizedServerThemeWrapper` (the `<html>`,
  `<head>`, `<body>` and every provider: theme, SWR, next-intl, dayjs locale, global
  config, user) → route-group layout. `(main)` renders `MainLayout` — an antd
  `Layout` with `Header` / `Content` / `Footer`; `(auth)` has its own.
- `<body>` carries `page-gradient-bg text-app-primary min-h-screen theme-transition`.
- **Responsive.** Tailwind breakpoints, `lg:` dominant (19 uses, against 9 `sm:`, 5 `md:`,
  4 `xl:`); most adaptation comes from the antd components themselves.
- **Motion.** `.theme-transition` (`globals.css:143`) animates background, border and
  colour over 0.3s and is applied on `<body>` and on surfaces that swap with the theme.
  Route changes show the `nextjs-toploader` bar (`NavigationProgress`).
- **No reduced-motion handling exists** — zero `motion-reduce:` and zero
  `prefers-reduced-motion` in `src/`. New animation should carry one.

## Components and states

| Need | Pattern |
|---|---|
| First load of a known shape | antd `<Skeleton active paragraph={{ rows: n }} />` |
| Refresh over content already on screen | `<Spin spinning={loading}>` wrapping the content |
| Pending action | the control's own `loading` prop (antd `Button`, `Table`) |
| Empty | antd `<Empty>`, `image={Empty.PRESENTED_IMAGE_SIMPLE}` for an inline region |
| Error (route) | `(main)/error.tsx` → `ErrorPage statusCode={500}` |
| Success | antd `message` / `notification` |

**Skeleton for a first paint, spin for a refresh — review-only.** A region whose shape is
already known should paint that shape rather than a centred spinner, so arriving data does
not move what is on screen. The code does not yet follow this: `<Skeleton>` appears in 4
files against `<Spin>` in 17, and 10 of those are a bare `<Spin size="large" />` standing
in for a whole page or block. The 8 `<Spin spinning={…}>` wrappers are already the right
shape for a refresh — they keep the old content visible underneath. Treat the bare
full-block spinners as debt; do not add one to a region whose layout is known.

**SWR drops back to the loading branch on every re-fetch.** `keepPreviousData` is used
nowhere, and the global config revalidates on reconnect (`src/lib/swr-config.tsx`:
`dedupingInterval` 2000, `revalidateOnFocus` false, `revalidateOnReconnect` true,
`errorRetryCount` 3). A list that branches on `isLoading` will therefore blank on a
reconnect; branch on whether data exists, or pass `keepPreviousData`, when the region is
already populated.

There are no App Router `loading.tsx` files; every pending state is rendered by the client
component that owns the fetch.

## Accessibility

**Async state is currently announced to nobody.** `aria-live`, `aria-busy` and
`role="status"` appear **zero** times in `src/`, so a screen reader gets nothing from any
of the 40 `isLoading` branches. New async UI should put `aria-busy` on the region being
filled and give a failure `role="alert"` — review-only until there is a guard.

What does hold today: `aria-label` on icon-only controls (8 files), `alt` on images
(8 files), `aria-hidden` on decoration (2 files). Ant Design carries keyboard behaviour
and focus for its own components — do not restyle their focus rings away. `--border-focus`
is the token for a hand-written one.

Never encode meaning in colour alone, and check contrast in both themes; the dark
palette's `--text-tertiary` (`110 118 129`) is the weakest pair in the set.

## Adding a page

1. Route under `src/app/[locale]/<group>/`, inside `(main)` or `(auth)`. A client
   component needs `'use client'`; keep it as far down the tree as possible.
2. Navigate and link through `@/i18n/routing` (`Link`, `useRouter`), never `next/link`
   directly — the locale prefix is `always`.
3. Copy through `useTranslations()`; add keys to `public/locales/zh-CN/translations.json`
   and the other six bundles, then `pnpm check:i18n`.
4. Fetch through a hook in `src/lib/api/hooks/`; components depend on hooks, not on
   `apiClient`.
5. Render loading, empty and error, at the region that changed.
6. Colours through `app-*` helpers or `rgb(var(--token))`; antd components take the theme
   from `antd-theme.ts` automatically.
7. Check light **and** dark, and a narrow viewport.
8. `pnpm lint`, `pnpm test`, `pnpm build`; `pnpm e2e` when a real browser is needed.

## Sources

- Tokens and themes: `src/app/globals.css`, `src/lib/antd-theme.ts`
- Theme wiring: `src/components/LocalizedServerThemeWrapper.tsx`,
  `src/contexts/ThemeClientContext.tsx`
- Shell: `src/components/layout/MainLayout/`
- Data fetching: `src/lib/swr-config.tsx`, `src/lib/api/hooks/`
- i18n: `src/i18n/routing.ts`, `public/locales/`
- Commands, lint rules and bundle-size guards: [`../AGENTS.md`](../AGENTS.md)
