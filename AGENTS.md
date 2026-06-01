# AGENTS.md

This is the ScriptList frontend repository. It is an independent git repository inside the parent workspace.

Before editing:

- Read this directory's `CLAUDE.md` when architecture details are needed.
- Run git commands from this directory, not from the parent workspace.
- Keep changes scoped to the task and never revert user changes unless explicitly asked.

Development workflow:

- Before fixing a bug, reproduce it in the running app with `pnpm dev` or trace the relevant component -> hook -> service -> API path.
- There is currently no automated test runner configured in `package.json`; for behavior changes, define the expected behavior, reproduce the failing case manually, implement the fix, and re-verify that exact case.
- If tests are introduced, wire the test runner into `package.json`; do not leave orphan test files.
- Verify frontend changes with `pnpm lint` and `pnpm build` before considering the work done.

Architecture rules:

- Server components are the default. Add `'use client'` only for interactive components.
- Keep presentation in components, fetching in SWR hooks under `src/lib/api/hooks`, HTTP in service wrappers under `src/lib/api/services`, and shared API shapes in `src/types/api.ts`.
- Components should depend on hooks/services, not `apiClient` directly.
- Server-side requests needing cookies should use `apiClient.getWithCookie()` or `apiClient.requestWithCookie()` from service wrappers.
- Client-side requests should go through service wrappers and hooks rather than bypassing the established layers.
- Use routing helpers from `@/i18n/routing` (`Link`, `useRouter`, `usePathname`, `redirect`) instead of `next/navigation`.
- Use `import type` for type-only imports.
- Use `useTranslations()` or `getTranslations()` for user-facing text.
- Add translations starting with `public/locales/zh-CN/translations.json`, then update the other locale files.
- Icons use `@iconify/react` with the existing icon packs.

Common verification:

```bash
pnpm lint
pnpm build
pnpm dev
```
