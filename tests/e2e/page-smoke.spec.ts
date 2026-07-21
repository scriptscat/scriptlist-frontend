import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { pageRoutes } from './routes';

const runtimeErrorPatterns = [
  /Application error/i,
  /Hydration failed/i,
  /Internal Server Error/i,
  /Unhandled Runtime Error/i,
  /cannot be a descendant of/i,
  /cannot contain a nested/i,
  /In HTML, <a> cannot/i,
];

function collectRuntimeIssues(page: Page) {
  const issues: string[] = [];

  page.on('pageerror', (error) => {
    issues.push(`pageerror: ${error.message}`);
  });

  page.on('console', (message) => {
    const text = message.text();
    if (runtimeErrorPatterns.some((pattern) => pattern.test(text))) {
      issues.push(`${message.type()}: ${text}`);
    }
  });

  return issues;
}

async function expectNoRuntimeIssues(page: Page, issues: string[]) {
  await page.waitForTimeout(200);
  expect(issues).toEqual([]);
}

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: 'e2e-token',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'login_id',
      value: '1',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
});

for (const route of pageRoutes) {
  test(`renders ${route}`, async ({ page }) => {
    const runtimeIssues = collectRuntimeIssues(page);
    const response = await page.goto(`/zh-CN${route}`, {
      waitUntil: 'commit',
    });

    expect(response?.status(), route).toBeLessThan(500);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect
      .poll(async () => page.locator('body').innerText())
      .not.toMatch(
        /Application error|Internal Server Error|Unhandled Runtime Error|This page could not be found/i,
      );
    await expectNoRuntimeIssues(page, runtimeIssues);
  });
}

test('main navigation can reach core public pages', async ({ page }) => {
  const runtimeIssues = collectRuntimeIssues(page);

  await page.goto('/zh-CN', { waitUntil: 'commit' });
  await expect(page.locator('body')).toContainText(/ScriptList|脚本/i);

  await page.goto('/zh-CN/search', { waitUntil: 'commit' });
  await expect(page.locator('body')).toContainText(/E2E Userscript|搜索|脚本/i);

  await page.goto('/zh-CN/script-show-page/1', {
    waitUntil: 'commit',
  });
  await expect(page.locator('body')).toContainText('E2E Userscript');
  await expectNoRuntimeIssues(page, runtimeIssues);
});
