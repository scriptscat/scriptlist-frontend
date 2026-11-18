import { expect, test } from '@playwright/test';
import {
  addLoginCookies,
  chooseOption,
  expectNoHorizontalOverflow,
  expectSearchRowFillsWidth,
  openMenu,
  useMobile,
  usesPrimaryStyling,
} from './mobile';

const PAGE_URL = '/zh-CN/admin/scripts';
// mock-api.ts 的 /admin/scripts 默认返回 8 行，第 3、6 行是已删除的脚本
const MOCK_ROWS = 8;

const isAdminScriptsRequest = (url: string, params: Record<string, string>) => {
  const u = new URL(url);
  if (!u.pathname.endsWith('/admin/scripts')) return false;
  return Object.entries(params).every(([k, v]) => u.searchParams.get(k) === v);
};

test.describe('mobile admin scripts cards', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('one card per row, safe primary, danger never primary, no overflow', async ({
    page,
  }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-admin-card]');
    await expect(cards).toHaveCount(MOCK_ROWS);
    await expect(cards.first()).toBeVisible();
    await expect(page.locator('.ant-table')).toBeHidden();

    // 普通行：主位是「修改可见性」；已删除行：主位是「恢复」
    const normal = cards.nth(0);
    const deleted = cards.filter({ hasText: '已删除' }).first();
    await expect(
      normal.locator('[data-admin-card-action][data-variant="primary"]'),
    ).toHaveText('修改可见性');
    await expect(
      deleted.locator('[data-admin-card-action][data-variant="primary"]'),
      // antd 会在两个汉字的按钮文字之间插入空格
    ).toHaveText(/^恢\s?复$/);

    for (const el of await page
      .locator('[data-admin-card-action][data-variant="danger"]')
      .all()) {
      expect(await usesPrimaryStyling(el)).toBe(false);
    }
    for (const el of await page
      .locator('[data-admin-card-action][data-variant="primary"]')
      .all()) {
      expect(await usesPrimaryStyling(el)).toBe(false);
    }

    await expectNoHorizontalOverflow(page);
  });

  test('search box fills its toolbar row', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await expectSearchRowFillsWidth(page, '输入关键词');
  });

  test('⋯ menu lists the rest with 删除 last in red', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const card = page.locator('[data-admin-card]').first();
    const menu = await openMenu(page, card);
    const items = menu.locator('.ant-dropdown-menu-item');
    await expect(items).toHaveText([
      '修改趋势分',
      'AI 审核',
      '设置评分系数',
      '删除',
    ]);
    await expect(items.last()).toHaveClass(/ant-dropdown-menu-item-danger/);
    await expect(menu.locator('.ant-dropdown-menu-item-divider')).toHaveCount(
      1,
    );
    for (const el of await menu
      .locator('[data-admin-card-action][data-variant="danger"]')
      .all()) {
      expect(await usesPrimaryStyling(el)).toBe(false);
    }

    // 菜单里的 AI 审核需要确认：走确认对话框，标题与表格相同
    await items.filter({ hasText: 'AI 审核' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(
      '确定要提交该脚本最新版本的 AI 审核任务吗？',
    );
  });

  test('toolbar status filter and sort change the request and results', async ({
    page,
  }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-admin-card]');
    await expect(cards).toHaveCount(MOCK_ROWS);

    const sort = page.getByRole('combobox', { name: '排序' });
    await expect(sort).toBeVisible();
    const sortRequest = page.waitForRequest((req) =>
      isAdminScriptsRequest(req.url(), {
        sort_field: 'trending_score',
        sort_order: 'desc',
      }),
    );
    await chooseOption(page, sort, '趋势分 降序');
    await sortRequest;
    // mock 按趋势分降序返回：第一张卡片趋势分最高
    await expect(cards.first()).toContainText('88');

    const status = page.getByRole('combobox', { name: '筛选状态' });
    await expect(status).toBeVisible();
    const statusRequest = page.waitForRequest((req) =>
      isAdminScriptsRequest(req.url(), {
        status: '2',
        sort_field: 'trending_score',
        sort_order: 'desc',
      }),
    );
    await chooseOption(page, status, '已删除');
    await statusRequest;
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) {
      await expect(card).toContainText('已删除');
    }
    await expectNoHorizontalOverflow(page);
  });

  test('pager shows page numbers only and pages the list', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-admin-card]')).toHaveCount(MOCK_ROWS);
    const pager = page.locator('.ant-pagination:visible');
    await expect(pager).toHaveCount(1);
    await expect(pager.locator('.ant-pagination-item')).toHaveText([
      '1',
      '2',
      '3',
    ]);
    await expect(pager.locator('.ant-pagination-total-text')).toHaveCount(0);
    await expect(pager.locator('.ant-pagination-options')).toHaveCount(0);

    const pageRequest = page.waitForRequest((req) =>
      isAdminScriptsRequest(req.url(), { page: '2' }),
    );
    await pager.locator('.ant-pagination-item', { hasText: '2' }).click();
    await pageRequest;
    await expect(pager.locator('.ant-pagination-item-active')).toHaveText('2');
  });
});

test.describe('desktop admin scripts table', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('table visible, cards hidden', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ant-table')).toBeVisible();
    await expect(page.locator('.ant-table-tbody .ant-table-row')).toHaveCount(
      MOCK_ROWS,
    );
    await expect(page.locator('[data-admin-card]').first()).toBeHidden();
    await expect(page.getByRole('combobox', { name: '排序' })).toBeHidden();
  });
});
