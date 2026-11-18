import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  addLoginCookies,
  expectNoHorizontalOverflow,
  useMobile,
} from './mobile';

const MENU_ITEMS = [
  '用户管理',
  '脚本管理',
  '相似度检测',
  '脚本审核',
  'AI 审核',
  '审核记录',
  '全站扫描',
  '反馈管理',
  '举报管理',
  '评分管理',
  '公告管理',
  '广告管理',
  'OAuth 应用管理',
  'OIDC 提供商管理',
  '系统配置',
];

// 外层卡片 body 与内容区的计算内边距（px）
async function shellPadding(page: Page) {
  return page.evaluate(() => {
    const pad = (el: Element | null) =>
      el ? getComputedStyle(el).paddingLeft : null;
    // 页面外壳另有 .ant-layout-content，所以从管理侧栏向上定位到外层卡片
    const body = document
      .querySelector('.ant-layout-sider')
      ?.closest('.ant-card-body');
    const content = body?.querySelector('.ant-layout-content') ?? null;
    return {
      card: pad(body ?? null),
      content: pad(content),
    };
  });
}

test.describe('mobile admin shell', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('users: sider hidden, trigger opens the bottom sheet and navigates', async ({
    page,
  }) => {
    await page.goto('/zh-CN/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ant-layout-sider')).toBeHidden();
    const trigger = page.getByRole('button', { name: /管理后台/ });
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('用户管理');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const sheet = page.getByRole('dialog');
    // 水合完成前点击无效，重试直到底部菜单打开
    await expect(async () => {
      await trigger.click();
      await expect(sheet).toBeVisible({ timeout: 2000 });
    }).toPass();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    for (const name of MENU_ITEMS) {
      await expect(sheet.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(sheet.getByRole('link', { name: '用户管理' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await sheet.getByRole('link', { name: '公告管理' }).click();
    await expect(page).toHaveURL(/\/zh-CN\/admin\/announcements/);
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('button', { name: /管理后台/ })).toContainText(
      '公告管理',
    );
  });

  test('ai-review: submenu page shows 父 · 子; Esc closes and refocuses', async ({
    page,
  }) => {
    await page.goto('/zh-CN/admin/ai-review', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('.ant-layout-sider')).toBeHidden();
    const trigger = page.getByRole('button', { name: /管理后台/ });
    await expect(trigger).toContainText('AI 审核 · 审核记录');

    const sheet = page.getByRole('dialog');
    // 水合完成前点击无效，重试直到底部菜单打开
    await expect(async () => {
      await trigger.click();
      await expect(sheet).toBeVisible({ timeout: 2000 });
    }).toPass();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('outer card padding is 12px and content padding is reduced', async ({
    page,
  }) => {
    await page.goto('/zh-CN/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /管理后台/ })).toBeVisible();
    await expect
      .poll(() => shellPadding(page))
      .toEqual({
        card: '12px',
        content: '0px',
      });
  });

  test('system-config form page has no horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/zh-CN/admin/system-config', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByRole('button', { name: /管理后台/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('desktop admin shell', () => {
  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('sider visible and no mobile trigger', async ({ page }) => {
    await page.goto('/zh-CN/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ant-layout-sider')).toBeVisible();
    await expect(page.getByRole('button', { name: /管理后台/ })).toBeHidden();
    // 桌面端内边距保持原样：Card body 24px，Content p-6 = 24px
    await expect
      .poll(() => shellPadding(page))
      .toEqual({
        card: '24px',
        content: '24px',
      });
  });
});
