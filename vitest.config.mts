import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit-test runner. Playwright specs live in `tests/e2e/*.spec.ts` and are run
// by `pnpm e2e`, so the include pattern is scoped to `src/` to keep the two
// runners from picking up each other's files.
//
// `.test.ts` files run in node environment (for utilities and non-React logic).
// `.test.tsx` files run in jsdom environment to support React component testing
// via @testing-library/react. Add `/** @vitest-environment jsdom */` docblock
// at the top of each .test.tsx file.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
