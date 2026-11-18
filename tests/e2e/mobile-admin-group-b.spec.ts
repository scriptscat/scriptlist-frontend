import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  addLoginCookies,
  chooseOption,
  clickUntil,
  expectNoHorizontalOverflow,
  useMobile,
  usesPrimaryStyling,
} from './mobile';

// mock-api.ts 的管理列表默认各返回 8 行
const MOCK_ROWS = 8;

const PAGES = {
  scriptReports: '/zh-CN/admin/reports',
  contentReports: '/zh-CN/admin/reports?tab=content',
  scriptAudits: '/zh-CN/admin/script-audits',
  aiReview: '/zh-CN/admin/ai-review',
} as const;

async function expectNoSolidDanger(page: Page) {
  for (const el of await page
    .locator('[data-admin-card-action][data-variant="danger"]')
    .all()) {
    expect(await usesPrimaryStyling(el)).toBe(false);
  }
  for (const el of await page
    .locator('[data-admin-card-action][data-variant="primary"]')
    .all()) {
    expect(await usesPrimaryStyling(el)).toBe(false);
    await expect(el).not.toHaveAttribute('data-variant', 'danger');
  }
}

function primaryOf(card: Locator) {
  return card.locator('[data-admin-card-action][data-variant="primary"]');
}

test.describe('mobile admin group B cards', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('script reports: 8 cards, primary 查看 is a link to the report', async ({
    page,
  }) => {
    await page.goto(PAGES.scriptReports, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-admin-card]:visible');
    await expect(cards).toHaveCount(MOCK_ROWS);
    await expect(page.locator('.ant-table:visible')).toHaveCount(0);

    const primary = primaryOf(cards.first());
    await expect(primary).toHaveText(/^查\s?看$/);
    const link = cards.first().locator('a:has([data-admin-card-action])');
    await expect(link).toHaveAttribute(
      'href',
      /\/script-show-page\/\d+\/report\/\d+$/,
    );
    await expectNoSolidDanger(page);
    await expectNoHorizontalOverflow(page);
  });

  test('content reports: 8 cards, primary 处理 / 查看 (as the table) opens the drawer', async ({
    page,
  }) => {
    // mock-api 没有内容举报详情路由；这里只为抽屉提供一份最小详情
    await page.route(/\/admin\/content-reports\/\d+$/, (route) => {
      const id = Number(route.request().url().split('/').pop());
      return route.fulfill({
        json: {
          code: 0,
          msg: 'ok',
          data: {
            id,
            target_type: 'score',
            target_id: 50,
            issue_id: 0,
            script_id: 1,
            script_name: '脚本',
            author_id: 2,
            author_name: '作者',
            summary: '内容',
            reason: 'spam',
            user_id: 3,
            username: '举报人',
            pending_count: 1,
            status: 1,
            handle_result: '',
            createtime: 1_700_000_000,
            snapshot: {
              title: '',
              content: '快照内容',
              score: 50,
              createtime: 1_700_000_000,
            },
            handler_id: 0,
            handler_name: '',
            handle_note: '',
            handletime: 0,
            reports: [],
          },
        },
      });
    });
    await page.goto(PAGES.contentReports, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-admin-card]:visible');
    await expect(cards).toHaveCount(MOCK_ROWS);
    await expect(page.locator('.ant-table:visible')).toHaveCount(0);

    // 与表格操作列一致：待处理行是「处理」，其余是「查看」（mock 第 1 行待处理、第 3 行已处理）
    await expect(primaryOf(cards.nth(2))).toHaveText(/^查\s?看$/);
    const primary = primaryOf(cards.first());
    await expect(primary).toHaveText(/^处\s?理$/);
    await clickUntil(primary, page.getByRole('dialog'));
    await expectNoSolidDanger(page);
    await page.keyboard.press('Escape');
    await expectNoHorizontalOverflow(page);
  });

  test('script audits: 8 cards, 审核 opens drawer, switch stays live, filters are toolbar dropdowns', async ({
    page,
  }) => {
    await page.goto(PAGES.scriptAudits, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-admin-card]:visible');
    await expect(cards).toHaveCount(MOCK_ROWS);
    await expect(page.locator('.ant-table:visible')).toHaveCount(0);
    await expect(cards.first().getByRole('switch')).toBeVisible();
    await expectNoSolidDanger(page);
    await expectNoHorizontalOverflow(page);

    const status = page.getByRole('combobox', { name: '状态', exact: true });
    const audit = page.getByRole('combobox', { name: '脚本审核状态' });
    await expect(status).toBeVisible();
    await expect(audit).toBeVisible();

    const statusReq = page.waitForRequest((req) => {
      const u = new URL(req.url());
      return (
        u.pathname.endsWith('/admin/script-audits') &&
        u.searchParams.get('status') === '2'
      );
    });
    await chooseOption(page, status, '已通过');
    await statusReq;

    const auditReq = page.waitForRequest((req) => {
      const u = new URL(req.url());
      return (
        u.pathname.endsWith('/admin/script-audits') &&
        u.searchParams.get('script_audit_status') === '1'
      );
    });
    await chooseOption(page, audit, '审核中');
    await auditReq;

    const primary = primaryOf(cards.first());
    await expect(primary).toHaveText(/^审\s?核$/);
    await clickUntil(primary, page.getByRole('dialog'));
    await expectNoHorizontalOverflow(page);
  });

  // spec：筛选项可以换行，但「标签：控件」始终在同一行
  test('script audits: each filter label stays on its dropdown line', async ({
    page,
  }) => {
    await page.goto(PAGES.scriptAudits, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-admin-card]:visible')).toHaveCount(
      MOCK_ROWS,
    );
    for (const name of ['状态', '脚本审核状态']) {
      const label = await page
        .getByText(`${name}:`, { exact: true })
        .boundingBox();
      const select = await page
        .getByRole('combobox', { name, exact: true })
        .locator('xpath=ancestor::*[contains(@class,"ant-select")][1]')
        .boundingBox();
      expect(
        Math.abs(
          label!.y + label!.height / 2 - (select!.y + select!.height / 2),
        ),
      ).toBeLessThan(6);
    }
  });

  test('ai review: each filter keeps its label and control on one line', async ({
    page,
  }) => {
    await page.goto(PAGES.aiReview, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-admin-card]:visible')).toHaveCount(
      MOCK_ROWS,
    );
    const items = page.locator('form .ant-form-item:visible');
    await expect(items).toHaveCount(2);
    for (const item of await items.all()) {
      const label = await item.locator('.ant-form-item-label').boundingBox();
      const control = await item
        .locator('.ant-form-item-control')
        .boundingBox();
      expect(Math.abs(label!.y - control!.y)).toBeLessThan(4);
    }
    await expectNoHorizontalOverflow(page);
  });

  test('ai review: 8 cards, primary 详情 opens drawer, pager is page numbers only', async ({
    page,
  }) => {
    // mock-api 的 records 前缀路由对详情也返回列表；这里只为抽屉提供一份最小详情
    await page.route(/\/admin\/ai-review\/records\/\d+$/, (route) => {
      const id = Number(route.request().url().split('/').pop());
      return route.fulfill({
        json: {
          code: 0,
          msg: 'ok',
          data: {
            id,
            script_id: 1,
            script_name: '脚本',
            script_audit_id: 0,
            status: 2,
            model: 'gpt-4o-mini',
            prompt_tokens: 10,
            completion_tokens: 5,
            latency_ms: 1000,
            reason: '理由',
            last_error: '',
            tags: ['network'],
            risk_signals: '[]',
            noisy_lines: '[]',
          },
        },
      });
    });
    await page.goto(PAGES.aiReview, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-admin-card]:visible');
    await expect(cards).toHaveCount(MOCK_ROWS);
    await expect(page.locator('.ant-table:visible')).toHaveCount(0);
    await expectNoSolidDanger(page);
    await expectNoHorizontalOverflow(page);

    const pager = page.locator('.ant-pagination:visible');
    await expect(pager).toHaveCount(1);
    await expect(pager.locator('.ant-pagination-options')).toHaveCount(0);

    const primary = primaryOf(cards.first());
    await expect(primary).toHaveText(/^详\s?情$/);
    await clickUntil(primary, page.getByRole('dialog'));
  });
});

test.describe('desktop admin group B tables', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  for (const [name, url] of Object.entries(PAGES)) {
    test(`${name}: table visible, cards hidden`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-table').first()).toBeVisible();
      await expect(page.locator('[data-admin-card]').first()).toBeHidden();
    });
  }
});
