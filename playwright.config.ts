import { defineConfig, devices } from '@playwright/test';

const appPort = Number(process.env.E2E_PORT || 3100);
const apiPort = Number(process.env.E2E_API_PORT || 3101);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html'], ['list']] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${appPort}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `E2E_API_PORT=${apiPort} pnpm e2e:mock-api`,
      url: `http://127.0.0.1:${apiPort}/healthz`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: `APP_API_URL=http://127.0.0.1:${apiPort} APP_API_PROXY=http://127.0.0.1:${apiPort} NEXT_PUBLIC_APP_URL=http://127.0.0.1:${appPort} pnpm predev && APP_API_URL=http://127.0.0.1:${apiPort} APP_API_PROXY=http://127.0.0.1:${apiPort} NEXT_PUBLIC_APP_URL=http://127.0.0.1:${appPort} pnpm exec next dev --hostname 127.0.0.1 --port ${appPort}`,
      url: `http://127.0.0.1:${appPort}/zh-CN`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
