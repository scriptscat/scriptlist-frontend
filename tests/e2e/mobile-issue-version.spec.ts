import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  addLoginCookies,
  expectNoHorizontalOverflow,
  useMobile,
} from './mobile';

// mock-api.ts 里有 240 个版本的脚本（每页 10 个，分页会渲染）
const MANY_VERSIONS = '/zh-CN/script-show-page/240/version';

async function openManyVersions(page: Page) {
  await page.goto(MANY_VERSIONS, { waitUntil: 'domcontentloaded' });
  const pager = page.locator('.ant-pagination').first();
  await expect(pager).toBeVisible({ timeout: 60_000 });
  return pager;
}

test.describe('issue / version pages on a phone', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('issue row meta breaks only at the dot separators', async ({ page }) => {
    await page.goto('/zh-CN/script-show-page/1/issue');
    const row = page.getByRole('link', { name: 'E2E issue' }).first();
    await expect(row).toBeVisible({ timeout: 60_000 });
    const segments = row.locator('.text-xs > .whitespace-nowrap');
    await expect(segments).toHaveCount(3);
    for (const seg of await segments.all()) {
      expect(await seg.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe(
        'nowrap',
      );
    }
    await expectNoHorizontalOverflow(page);
    // 外层卡片内边距 12px
    const pad = await page
      .locator('.ant-card-body')
      .first()
      .evaluate((el) => getComputedStyle(el).paddingLeft);
    expect(pad).toBe('12px');
  });

  test('version page has no horizontal overflow', async ({ page }) => {
    // 脚本 1 只有 1 个版本，不渲染分页；分页见下方 240 个版本的用例。
    await page.goto('/zh-CN/script-show-page/1/version');
    await expect(page.getByText('1.0.0').first()).toBeVisible({
      timeout: 60_000,
    });
    await expectNoHorizontalOverflow(page);
  });

  test('version pagination: no total text, page numbers centred on one line', async ({
    page,
  }) => {
    const pager = await openManyVersions(page);
    await expect(pager.locator('.ant-pagination-item').first()).toBeVisible();
    await expect(pager.locator('.ant-pagination-total-text')).toBeHidden();
    const layout = await pager.evaluate((el) => {
      const items = [...el.children]
        .filter((c) => (c as HTMLElement).offsetParent !== null)
        .map((c) => c.getBoundingClientRect());
      const left = Math.min(...items.map((r) => r.left));
      const right = Math.max(...items.map((r) => r.right));
      return {
        tops: [...new Set(items.map((r) => Math.round(r.top)))],
        centre: (left + right) / 2,
        viewport: document.documentElement.clientWidth,
      };
    });
    expect(layout.tops, 'pagination items share one row').toHaveLength(1);
    expect(Math.abs(layout.centre - layout.viewport / 2)).toBeLessThanOrEqual(
      24,
    );
    await expectNoHorizontalOverflow(page);
  });

  // 窄屏 = < md：sm（640）~ md（768）之间同样收窄
  test('issue card padding is 12px below md too', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('/zh-CN/script-show-page/1/issue', {
      waitUntil: 'domcontentloaded',
    });
    await expect(
      page.getByRole('link', { name: 'E2E issue' }).first(),
    ).toBeVisible({ timeout: 60_000 });
    const pad = await page
      .locator('.ant-card-body')
      .first()
      .evaluate((el) => getComputedStyle(el).paddingLeft);
    expect(pad).toBe('12px');
  });
});

test.describe('issue / version pages before hydration', () => {
  useMobile(test);
  // 服务端 HTML（水合前）同样不能横向溢出
  test.use({ javaScriptEnabled: false });

  for (const path of [
    '/zh-CN/script-show-page/1',
    '/zh-CN/script-show-page/1/issue',
    '/zh-CN/script-show-page/1/version',
  ]) {
    test(`${path} has no horizontal overflow before hydration`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      // dev 下 antd 的 reset（body margin 0）由 JS 注入，禁用 JS 时 body 带默认 8px 外边距，
      // 所以这里只看页面级（documentElement）的横向滚动。
      const { scroll, client } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(scroll, 'documentElement.scrollWidth').toBeLessThanOrEqual(client);
    });
  }
});

test.describe('version pagination on desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('total text is still shown', async ({ page }) => {
    const pager = await openManyVersions(page);
    await expect(pager.locator('.ant-pagination-total-text')).toBeVisible();
    await expect(pager.locator('.ant-pagination-total-text')).toContainText(
      '240',
    );
  });
});
