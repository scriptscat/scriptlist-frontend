import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit-test runner. Playwright specs live in `tests/e2e/*.spec.ts` and are run
// by `pnpm e2e`, so the include pattern is scoped to `src/` to keep the two
// runners from picking up each other's files.
//
// `.ts` only: there is no React renderer wired up here (see the note at the top
// of useMarkdownParser.test.ts), so nothing can meaningfully be a `.test.tsx`
// yet and the pattern for it only advertised a capability this project does not
// have. Add it back together with the renderer.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
