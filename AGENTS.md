# AGENTS.md

ScriptList Frontend — a userscript sharing platform ([scriptcat.org](https://scriptcat.org)) for Tampermonkey/ScriptCat scripts. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Ant Design 6. Backend is Golang (separate repo at `../scriptlist/`). This is an independent git repository inside the parent workspace.

> ⚠️ **请勿编辑 `CLAUDE.md` (Do not edit `CLAUDE.md`).** `CLAUDE.md` 仅通过 `@AGENTS.md` 引用本文件；所有开发指南的新增或修改都写入 `AGENTS.md`。
> `CLAUDE.md` only imports this file via `@AGENTS.md`; make all additions and changes to the guidance here in `AGENTS.md`, not in `CLAUDE.md`.

## Before Editing

- Run git commands from this directory, not from the parent workspace.
- Keep changes scoped — touch only files the task requires (no opportunistic refactors, reformatting, or unrelated edits) — and never revert the user's own changes unless explicitly asked.

## Development Workflow

Apply these rules to every change here:

- **Confirm a bug exists before fixing it.** Reproduce it in the running app (`pnpm dev`) or trace the relevant component → hook (`src/lib/api/hooks`) → service (`src/lib/api/services`) → API path first. Do not change code on suspicion alone.
- **TDD/BDD mindset.** There is currently **no automated test runner** configured in this project (no test deps or scripts in `package.json`). So define the expected behavior up front, reproduce the failing case manually, then implement and re-verify that exact case. If you introduce tests, wire the runner into `package.json` rather than leaving orphan test files.
- **Follow SOLID and the existing architecture.** Keep server components server-side, isolate interactivity in `'use client'` components, put data access in `src/lib/api/services`, and consume it through the SWR hooks — don't bypass the layers.
- **高内聚低耦合 (high cohesion, low coupling).** One responsibility per layer: presentation in components, fetching in SWR hooks (`src/lib/api/hooks`), HTTP in service classes (`src/lib/api/services`), shared shapes in `src/types/api.ts`. Components depend on hooks/services, not on `apiClient` directly; navigate via `@/i18n/routing`, not `next/navigation`. Keep server vs `'use client'` boundaries clean so a change in one doesn't ripple into the other.
- **Keep changes scoped.** Touch only files the task requires — no opportunistic refactors, reformatting, or unrelated edits — and never revert the user's own changes unless explicitly asked.
- Verify with `pnpm lint` and `pnpm build` before considering the work done.

## Commands

```bash
pnpm dev              # Start dev server (runs prebuild automatically)
pnpm build            # Production build (runs prebuild automatically)
pnpm start            # Start production server
pnpm lint             # ESLint check
pnpm lint-fix         # ESLint auto-fix
```

The prebuild step (`scripts/prebuild.tsx`) extracts Ant Design CSS statically and copies Monaco editor files to `public/`.

## Architecture

### Routing & i18n

All routes are locale-prefixed: `/[locale]/...` (e.g., `/en/scripts`, `/zh-CN/scripts`). Locales: `en`, `zh-CN`, `zh-TW`, `ru`, `ja`, `de` (6 locales). Default locale is `en` with `localePrefix: 'always'`. Locale detection runs through `src/proxy.ts` — this is the `next-intl` middleware; Next.js 16 renamed the `middleware.ts` convention file to `proxy.ts`, so edit `src/proxy.ts` (not `middleware.ts`) to change matcher/locale-detection behavior.

Note: routing uses short keys (`en`, `de`) while `public/locales/` uses full tags (`en-US`, `de-DE`). The mapping is defined in `src/i18n/routing.ts` via `languageMap`.

Use `next-intl` for translations. Primary language is `zh-CN` — set translations in `public/locales/zh-CN/translations.json` first, then add translations for the other locales in their respective `public/locales/<locale>/translations.json` files.

**Navigation**: Use `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/routing` (NOT from `next/navigation`). The custom `useRouter` integrates `nextjs-toploader` for progress bar support and provides: `push`, `back`, `refresh`, `locale`.

### Route Groups

Routes are organized into two layout groups under `src/app/[locale]/`:

- **`(main)/`** — Main app routes with `MainLayout` (header, nav, footer). Contains:
  - `search/`, `scripts/`, `script-show-page/[id]/`, `users/[id]/`, `notifications/`, `chat/`
  - `admin/` — Admin dashboard with its own layout using `PageIntlProvider` for admin-specific translations
- **`(auth)/`** — Auth routes with minimal `AuthLayout` (login, register, forgot-password, reset-password, OIDC binding)

Admin pages follow the pattern: async server component `page.tsx` + interactive `components/<Feature>Client.tsx` client component. The admin console (`(main)/admin/`) is itself split by domain: `scripts/`, `users/`, `reports/`, `feedbacks/`, `script-audits/`, `ai-review/`, `similarity/`, `announcements/`, `oauth-apps/`, `oidc-providers/`, `scores/`, `system-config/`.

### Feature Domains

Beyond plain script CRUD, several cross-cutting subsystems each span a route area + hook + service + (often) admin page. Touch the whole vertical, not just the page:

- **AI code review** — `services/aiReview.ts` + `hooks/useAIReviews.ts`, surfaced on script pages and moderated under `admin/ai-review/`.
- **Code-similarity detection** — `(main)/similarity/` + `components/similarity/` + `services/similarity.ts`; integrity rejections surface via `components/IntegrityErrorAlert/` and error code `114005` (see `errorCodes.ts`).
- **Audit logs** — `(main)/audit-logs/` + `hooks/auditLog.ts` + `services/auditLog.ts` (management/moderation trail).
- **Announcements** — `components/AnnouncementBanner.tsx` + `hooks/announcement.ts`, authored under `admin/announcements/`.
- **Chat / AI agents** — `(main)/chat/` backed by `@cago-frame/agents-client` (`services/chat.ts`, `hooks/chat.ts`).
- **Auth methods** — OAuth via BBS (`UserContext`), WebAuthn / passkeys (`@simplewebauthn/browser`, `services/webauthn.ts`), OIDC provider binding (`services/oidc.ts`, `(auth)/auth/`), and Cloudflare Turnstile (`@marsidev/react-turnstile`) on auth forms.

### Editors & Markdown

- **Monaco** (`components/MonacoEditor/`, `components/ScriptEditor/`) for script create/edit and diffs. The prebuild step copies Monaco assets into `public/monaco/` (served with immutable caching via `next.config.ts` headers) rather than bundling them.
- **Toast UI** markdown editor (`components/MarkdownEditor/`) for authoring; **`components/MarkdownView/`** renders with `marked` + `prismjs` and **must** sanitize through `xss` — keep that sanitization when changing render paths.

### API Layer

- **Client**: `src/lib/api/client.ts` — singleton `apiClient` with GET/POST/PUT/DELETE methods. Timeout: 20s. Credentials included automatically.
- **Services**: `src/lib/api/services/` — service classes wrapping `apiClient` calls. Use `cache()` from React for server-side deduplication (e.g., `getUserDetailCache`). The script domain is large enough to be its own sub-namespace, `services/scripts/` (`scripts`, `access`, `favorites`, `issue`, `report`, `statistics`) — import from there, not a single monolithic file.
- **Hooks**: `src/lib/api/hooks/` — SWR-based data fetching hooks. Keys follow format `['resource-type', resourceId, params]`. Accept optional `initialData` for SSR.
- **Types**: `src/types/api.ts` — `APIResponse<T>` (`{ code: 0, data: T, msg: string }`), `APIError`, `ListData<T>`, `PageRequest`
- **Error handling**: the backend returns a non-zero numeric `code` on failure, surfaced as `APIError` (`error.ts`). Known codes worth branching on are named in `errorCodes.ts` (e.g. `SimilarityIntegrityRejected = 114005`) — match those constants rather than hard-coding numbers.

Server-side requests needing cookies use `apiClient.getWithCookie()` / `apiClient.requestWithCookie()`. These forward auth cookies (`login_id`, `token`) via `ServerCookieUtils`. Client-side uses regular `apiClient.get()` etc.

`src/lib/api/index.ts` re-exports a small set of services plus a back-compat `api.{get,post,put,delete}` shim; prefer importing the specific service/hook over the shim in new code.

### State Management

React Context providers in `src/contexts/`:
- `UserContext` — auth state, login/logout via OAuth, token refresh every 3 days
- `ThemeClientContext` — light/dark mode with Ant Design theme config, persisted to cookie
- `ThemeContext` — server-side theme context (provides initial theme before hydration)
- `ScriptSettingContext` — script-specific settings
- `GlobalConfigContext` — app-wide configuration and feature flags

Data fetching uses SWR with global config: 2s deduping, no focus revalidation, reconnect revalidation enabled.

### Environment Variables

```
NEXT_PUBLIC_APP_URL   # Client-side app URL
APP_API_URL           # Server-side API base URL
APP_API_PROXY         # API proxy destination (used in next.config.ts rewrites)
```

Frontend proxies API calls via Next.js rewrites: `/api/v2/:path*` → `APP_API_PROXY/:path*`. `next.config.ts` also sets global security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`), immutable long-cache headers for `/assets`, `/styles`, `/monaco`, and `optimizePackageImports` for `antd` / `@ant-design/*` / `@iconify/react`. `pnpm` is pinned via `packageManager` (`pnpm@10.x`); use it rather than npm/yarn.

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- ESLint enforces `@typescript-eslint/consistent-type-imports` (use `import type` for type-only imports)
- `react/jsx-no-literals` is warned — prefer `useTranslations()` / `getTranslations()` for user-facing text
- `react-hooks/exhaustive-deps` is disabled
- Prettier with single quotes
- Standalone output mode for Docker deployments
- Tailwind uses a GitHub-style color system (custom primary, neutral, success, warning, error colors) with light/dark mode via CSS variables
- Icons use `@iconify/react` with icon packs: `mdi`, `mingcute`, `logos`, `noto`
- Server components by default; add `'use client'` only for interactive components
