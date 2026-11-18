import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  addLoginCookies,
  chooseOption,
  expectNoHorizontalOverflow,
  useMobile,
  usesPrimaryStyling,
} from './mobile';

const PAGE_URL = '/zh-CN/admin/similarity';
// mock-api.ts 的 /admin/similarity/* 每张表返回 8 行
const MOCK_ROWS = 8;

// 完整性警告表与桌面表格一样隐藏已删除脚本的行（mock 第 5 行已删除），卡片与表格保持一致
const TABS = [
  { name: '相似对', cards: MOCK_ROWS },
  { name: '嫌疑脚本', cards: MOCK_ROWS },
  { name: '完整性警告', cards: MOCK_ROWS - 1 },
  { name: '相似对白名单', cards: MOCK_ROWS },
  { name: '完整性豁免', cards: MOCK_ROWS },
] as const;

const WHITELIST_TABS = ['相似对白名单', '完整性豁免'];

async function openTab(page: Page, name: string) {
  // 不用 exact：非鼠标聚焦的标签会多出「Tab x of y」读屏文本，名字变成「Tab 2 of 6 嫌疑脚本」；
  // 只锚定结尾，避免「相似对」误中「相似对白名单」
  const tab = page.getByRole('tab', { name: new RegExp(`(^|\\s)${name}$`) });
  // 水合完成前点击无效，重试直到标签被选中
  await expect(async () => {
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true', {
      timeout: 2000,
    });
  }).toPass();
}

// 当前激活标签页里的卡片 / 表格
const activePane = (page: Page) => page.locator('[role="tabpanel"]:visible');

test.describe('mobile admin similarity cards', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  for (const { name, cards: expected } of TABS) {
    test(`${name}: one card per row, no overflow`, async ({ page }) => {
      await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
      await openTab(page, name);
      const cards = activePane(page).locator('[data-admin-card]');
      await expect(cards).toHaveCount(expected);
      await expect(cards.first()).toBeVisible();
      await expect(activePane(page).locator('.ant-table-wrapper')).toBeHidden();
      await expectNoHorizontalOverflow(page);
    });
  }

  test('相似对 card shows both scripts, badges, primary 详情 link', async ({
    page,
  }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const first = activePane(page).locator('[data-admin-card]').first();
    await expect(first).toContainText('↔');
    await expect(first).toContainText('待审查');
    await expect(first).toContainText('0.970');
    const detail = first.locator(
      '[data-admin-card-action][data-variant="primary"]',
    );
    await expect(detail).toHaveText(/^详\s?情$/);
    await expect(
      first.locator('a[href$="/admin/similarity/pairs/300"]'),
    ).toContainText(/详\s?情/);
    expect(await usesPrimaryStyling(detail)).toBe(false);
  });

  test('相似对 toolbar sort dropdown reorders the list', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const cards = activePane(page).locator('[data-admin-card]');
    await expect(cards).toHaveCount(MOCK_ROWS);
    await expect(cards.first()).toContainText('0.970');

    const sort = page.getByRole('combobox', { name: '排序' });
    await expect(sort).toBeVisible();
    await chooseOption(page, sort, 'Jaccard 升序');
    await expect(cards.first()).toContainText('0.550');
    await expect(cards.last()).toContainText('0.970');
    await chooseOption(page, sort, 'Jaccard 降序');
    await expect(cards.first()).toContainText('0.970');
    await expectNoHorizontalOverflow(page);
  });

  test('嫌疑脚本 card carries top sources and has no actions', async ({
    page,
  }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await openTab(page, '嫌疑脚本');
    const cards = activePane(page).locator('[data-admin-card]');
    await expect(cards).toHaveCount(MOCK_ROWS);
    await expect(cards.first()).toContainText('Jaccard 0.900');
    // 贡献占比是 0~1 的小数，显示为百分比
    await expect(cards.first()).toContainText('contrib 60.0%');
    // 副信息行：#ID（该表的主对象是脚本）
    await expect(
      cards.first().locator('[data-admin-card-subtitle]'),
    ).toHaveText('#1');
    await expect(cards.first().locator('[data-admin-card-action]')).toHaveCount(
      0,
    );
  });

  test('完整性警告: 详情 primary, 处理 only on pending rows', async ({
    page,
  }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await openTab(page, '完整性警告');
    const cards = activePane(page).locator('[data-admin-card]');
    await expect(cards).toHaveCount(MOCK_ROWS - 1);
    const pending = cards.filter({ hasText: '待审' });
    const done = cards.filter({ hasText: '违规' }).first();
    await expect(
      pending
        .first()
        .locator('[data-admin-card-action][data-variant="primary"]'),
    ).toHaveText(/^详\s?情$/);
    // 待审行有「详情」与「处理」两个操作，已处理行只有「详情」
    await expect(
      pending.first().locator('[data-admin-card-action]'),
    ).toHaveCount(2);
    await expect(done.locator('[data-admin-card-action]')).toHaveCount(1);
    const resolve = pending
      .first()
      .locator('[data-admin-card-action]', { hasText: /处\s?理/ });
    await expect(async () => {
      await resolve.click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });
    }).toPass();
  });

  for (const name of WHITELIST_TABS) {
    test(`${name}: 移除 is a danger outline, no primary`, async ({ page }) => {
      await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
      await openTab(page, name);
      const cards = activePane(page).locator('[data-admin-card]');
      await expect(cards).toHaveCount(MOCK_ROWS);
      await expect(
        activePane(page).locator(
          '[data-admin-card-action][data-variant="primary"]',
        ),
      ).toHaveCount(0);
      const removes = activePane(page).locator(
        '[data-admin-card-action][data-variant="danger"]',
      );
      await expect(removes).toHaveCount(MOCK_ROWS);
      for (const el of await removes.all()) {
        await expect(el).toHaveText(/^移\s?除$/);
        expect(await usesPrimaryStyling(el)).toBe(false);
      }
      // 沿用原来的确认方式：点击弹出确认对话框
      await expect(async () => {
        await removes.first().click();
        await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });
      }).toPass();
      await expect(page.getByRole('dialog')).toContainText('确');
    });
  }
});

test.describe('desktop admin similarity tables', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  for (const { name, cards } of TABS) {
    test(`${name}: table visible, cards hidden`, async ({ page }) => {
      await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
      await openTab(page, name);
      await expect(
        activePane(page).locator('.ant-table-wrapper'),
      ).toBeVisible();
      await expect(
        activePane(page).locator('.ant-table-tbody .ant-table-row'),
      ).toHaveCount(cards);
      await expect(
        activePane(page).locator('[data-admin-card]').first(),
      ).toBeHidden();
    });
  }
});
