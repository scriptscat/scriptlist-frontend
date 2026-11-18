import { expect, test } from '@playwright/test';
import {
  addLoginCookies,
  expectNoHorizontalOverflow,
  expectSearchRowFillsWidth,
  useMobile,
  usesPrimaryStyling,
} from './mobile';

// mock-api.ts 的每个管理列表默认返回 8 行
const MOCK_ROWS = 8;

// primary = 该卡片主位的标签；null 表示没有主位（仅危险操作，红色描边）
const PAGES = [
  { name: 'users', url: '/zh-CN/admin/users', primary: '修改等级' },
  { name: 'feedbacks', url: '/zh-CN/admin/feedbacks', primary: null },
  { name: 'scores', url: '/zh-CN/admin/scores', primary: null },
  { name: 'announcements', url: '/zh-CN/admin/announcements', primary: '编辑' },
] as const;

test.describe('mobile admin group A cards', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  for (const { name, url, primary } of PAGES) {
    test(`${name}: one card per row, danger never primary, no overflow`, async ({
      page,
    }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const cards = page.locator('[data-admin-card]');
      await expect(cards).toHaveCount(MOCK_ROWS);
      await expect(cards.first()).toBeVisible();
      await expect(page.locator('.ant-table')).toBeHidden();

      for (const el of await page
        .locator('[data-admin-card-action][data-variant="danger"]')
        .all()) {
        expect(await usesPrimaryStyling(el)).toBe(false);
      }
      // 危险操作不占主位
      await expect(
        page.locator(
          '[data-admin-card-action][data-variant="primary"][data-variant="danger"]',
        ),
      ).toHaveCount(0);

      const primaries = page.locator(
        '[data-admin-card-action][data-variant="primary"]',
      );
      if (primary === null) {
        await expect(primaries).toHaveCount(0);
        await expect(
          cards
            .first()
            .locator('[data-admin-card-action][data-variant="danger"]'),
        ).toHaveCount(1);
      } else if (name === 'users') {
        // 正常用户的主位是「修改等级」；被封禁的用户第一个安全操作是「解封」
        const active = cards.filter({
          has: page.locator('[data-variant="danger"]'),
        });
        expect(await active.count()).toBeGreaterThan(0);
        for (const card of await active.all()) {
          await expect(
            card.locator('[data-admin-card-action][data-variant="primary"]'),
          ).toHaveText(/^修\s?改\s?等\s?级$/);
        }
      } else {
        for (const el of await primaries.all()) {
          await expect(el).toHaveText(/^编\s?辑$/);
        }
        await expect(primaries).toHaveCount(MOCK_ROWS);
      }

      await expectNoHorizontalOverflow(page);
    });
  }

  // spec：工具栏里的搜索框占满一行
  for (const { name, url, search } of [
    { name: 'users', url: '/zh-CN/admin/users', search: '搜索用户名或邮箱' },
    { name: 'scores', url: '/zh-CN/admin/scores', search: '搜索评价内容' },
  ]) {
    test(`${name}: search box fills its toolbar row`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expectSearchRowFillsWidth(page, search);
    });
  }
});

test.describe('desktop admin group A tables', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  for (const { name, url } of PAGES) {
    test(`${name}: table visible, cards hidden`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-table')).toBeVisible();
      await expect(page.locator('.ant-table-tbody .ant-table-row')).toHaveCount(
        MOCK_ROWS,
      );
      await expect(page.locator('[data-admin-card]').first()).toBeHidden();
    });
  }
});
