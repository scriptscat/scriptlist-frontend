import { expect, test } from '@playwright/test';
import {
  addLoginCookies,
  chooseOption,
  expectNoHorizontalOverflow,
  openMenu,
  useMobile,
  usesPrimaryStyling,
} from './mobile';

// mock-api.ts 的三个列表默认各返回 8 行
const MOCK_ROWS = 8;
const PAGES = [
  '/zh-CN/admin/advertise',
  '/zh-CN/admin/oauth-apps',
  '/zh-CN/admin/oidc-providers',
];

const isAdRequest = (url: string, params: Record<string, string>) => {
  const u = new URL(url);
  if (!u.pathname.endsWith('/advertise/admin')) return false;
  return Object.entries(params).every(([k, v]) => u.searchParams.get(k) === v);
};

test.describe('mobile admin group D cards', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  for (const url of PAGES) {
    test(`${url}: one card per row, no danger primary, no overflow`, async ({
      page,
    }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const cards = page.locator('[data-admin-card]');
      await expect(cards).toHaveCount(MOCK_ROWS);
      await expect(page.locator('.ant-table')).toBeHidden();

      for (const card of await cards.all()) {
        await expect(
          card.locator('[data-admin-card-action][data-variant="primary"]'),
        ).toHaveText(/^编\s?辑$/);
      }
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
  }

  test('advertise: 编辑 + 删除 are both shown, 删除 is danger', async ({
    page,
  }) => {
    await page.goto(PAGES[0], { waitUntil: 'domcontentloaded' });
    const card = page.locator('[data-admin-card]').first();
    await expect(card).toBeVisible();
    await expect(
      card.locator('[data-admin-card-action][data-variant="danger"]'),
    ).toHaveText(/^删\s?除$/);
  });

  // 次要字段沿用表格单元格：多广告位条目的曝光 / 点击带「N 个广告位合计」说明
  test('advertise: stats field keeps the multi-slot note', async ({ page }) => {
    await page.goto(PAGES[0], { waitUntil: 'domcontentloaded' });
    const card = page.locator('[data-admin-card]').first();
    await expect(card).toBeVisible();
    await expect(card).toContainText('2 个广告位合计');
  });

  test('advertise: toolbar filters change the request', async ({ page }) => {
    await page.goto(PAGES[0], { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-admin-card]')).toHaveCount(MOCK_ROWS);

    const slot = page.getByRole('combobox', { name: '广告位' });
    const type = page.getByRole('combobox', { name: '类型' });
    const enabled = page.getByRole('combobox', { name: '状态' });
    await expect(slot).toBeVisible();
    await expect(type).toBeVisible();
    await expect(enabled).toBeVisible();

    const slotRequest = page.waitForRequest((req) =>
      isAdRequest(req.url(), { slot: 'home-banner' }),
    );
    await chooseOption(page, slot, '首页横幅');
    await slotRequest;
    await page.waitForLoadState('networkidle');

    const typeRequest = page.waitForRequest((req) =>
      isAdRequest(req.url(), { slot: 'home-banner', ad_type: 'adsense' }),
    );
    await chooseOption(page, type, 'AdSense');
    await typeRequest;
    await page.waitForLoadState('networkidle');

    const enabledRequest = page.waitForRequest((req) =>
      isAdRequest(req.url(), {
        slot: 'home-banner',
        ad_type: 'adsense',
        enabled: 'false',
      }),
    );
    await chooseOption(page, enabled, '禁用');
    await enabledRequest;
    await expectNoHorizontalOverflow(page);
  });

  test('oauth: client id copyable; ⋯ lists 重置密钥 then 删除 last', async ({
    page,
  }) => {
    await page.goto(PAGES[1], { waitUntil: 'domcontentloaded' });
    const card = page.locator('[data-admin-card]').first();
    await expect(card).toBeVisible();
    await expect(card.locator('.ant-typography-copy')).toHaveCount(1);

    const menu = await openMenu(page, card);
    const items = menu.locator('.ant-dropdown-menu-item');
    await expect(items).toHaveText(['重置密钥', '删除']);
    await expect(items.last()).toHaveClass(/ant-dropdown-menu-item-danger/);

    await items.first().click();
    await expect(page.getByRole('dialog')).toContainText(
      '确定要重置此应用的 Client Secret 吗？旧密钥将立即失效。',
    );
  });

  test('oidc: icon precedes the title', async ({ page }) => {
    await page.goto(PAGES[2], { waitUntil: 'domcontentloaded' });
    const card = page.locator('[data-admin-card]').first();
    await expect(card).toBeVisible();
    const icon = card.locator('[data-provider-icon]');
    await expect(icon).toHaveCount(1);
    const iconBox = await icon.boundingBox();
    const titleBox = await card
      .locator('[data-admin-card-title]')
      .boundingBox();
    expect(iconBox && titleBox && iconBox.x < titleBox.x).toBe(true);
  });
});

test.describe('desktop admin group D tables', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  for (const url of PAGES) {
    test(`${url}: table visible, cards hidden`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-table').first()).toBeVisible();
      await expect(page.locator('.ant-table-tbody .ant-table-row')).toHaveCount(
        MOCK_ROWS,
      );
      await expect(page.locator('[data-admin-card]').first()).toBeHidden();
    });
  }
});
