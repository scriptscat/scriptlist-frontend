import { expect, test } from '@playwright/test';

// Regression test for scriptscat/scriptlist-frontend#64:
// In "follow system" (auto) mode, a fresh visit with a dark OS used to render a
// mixed page — Tailwind surfaces (data-theme) went dark via the inline script,
// but antd surfaces (header via theme.useToken(), sidebar cards via cssVar) stayed
// light because the antd theme was never synced to the system preference after
// hydration. data-theme and the antd theme must stay consistent.

// darkToken.colorBgContainer = #161b22, lightToken.colorBgContainer = #ffffff
const DARK_CONTAINER = 'rgb(22, 27, 34)';
const LIGHT_CONTAINER = 'rgb(255, 255, 255)';

// No theme cookie in a fresh context => server defaults to auto mode.
test.describe('auto (follow system) theme coverage', () => {
  test('dark system → header and cards render dark, matching data-theme', async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/zh-CN/search', { waitUntil: 'networkidle' });

    // Tailwind side (data-theme) resolves to dark.
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.getAttribute('data-theme'),
        ),
      )
      .toBe('dark');

    // antd header (background = theme.useToken().colorBgContainer) must follow.
    const header = page.locator('[data-layout-header]');
    await expect(header).toHaveCSS('background-color', DARK_CONTAINER);

    // No antd Card may stay light while the page is dark (the reported "coverage
    // incomplete" symptom was white sidebar cards on a dark page).
    const lightCards = await page
      .locator('.ant-card')
      .evaluateAll(
        (cards, light) =>
          cards.filter((c) => getComputedStyle(c).backgroundColor === light)
            .length,
        LIGHT_CONTAINER,
      );
    expect(lightCards).toBe(0);

    await context.close();
  });

  test('light system → header renders light', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/zh-CN/search', { waitUntil: 'networkidle' });

    await expect
      .poll(() =>
        page.evaluate(() =>
          document.documentElement.getAttribute('data-theme'),
        ),
      )
      .toBe('light');

    const header = page.locator('[data-layout-header]');
    await expect(header).toHaveCSS('background-color', LIGHT_CONTAINER);

    await context.close();
  });
});
