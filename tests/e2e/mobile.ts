import { expect } from '@playwright/test';
import type { BrowserContext, Locator, Page, TestType } from '@playwright/test';

// 与 iPhone 13 等窄屏手机一致的视口，供移动端 e2e 共用。
export const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;

// 在 test.describe 内调用：本文件的用例使用窄屏 + 触屏，不新增 Playwright project。
export function useMobile(test: Pick<TestType<object, object>, 'use'>) {
  test.use({
    viewport: MOBILE_VIEWPORT,
    isMobile: true,
    hasTouch: true,
  });
}

// 登录态：与 page-smoke.spec.ts 的 beforeEach 相同（mock API 返回管理员用户）。
export async function addLoginCookies(context: BrowserContext) {
  await context.addCookies(
    ['token:e2e-token', 'login_id:1'].map((pair) => {
      const [name, value] = pair.split(':');
      return {
        name,
        value,
        domain: '127.0.0.1',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax' as const,
      };
    }),
  );
}

// 页面不应横向溢出：documentElement 与 body 的 scrollWidth 均不超过 clientWidth。
export async function expectNoHorizontalOverflow(page: Page) {
  const { docScroll, docClient, bodyScroll, bodyClient } = await page.evaluate(
    () => ({
      docScroll: document.documentElement.scrollWidth,
      docClient: document.documentElement.clientWidth,
      bodyScroll: document.body.scrollWidth,
      bodyClient: document.body.clientWidth,
    }),
  );
  expect(docScroll, 'documentElement.scrollWidth').toBeLessThanOrEqual(
    docClient,
  );
  expect(bodyScroll, 'body.scrollWidth').toBeLessThanOrEqual(bodyClient);
}

// 管理后台窄屏工具栏：搜索框和搜索按钮同在一行，整行与卡片列表等宽，行内没有其他控件。
export async function expectSearchRowFillsWidth(
  page: Page,
  placeholder: string,
) {
  const input = page.getByPlaceholder(placeholder, { exact: true });
  const button = page.getByRole('button', { name: /搜\s?索/ });
  const card = page.locator('[data-admin-card]').first();
  await expect(card).toBeVisible();
  const [i, b, c] = await Promise.all([
    input.boundingBox(),
    button.boundingBox(),
    card.boundingBox(),
  ]);
  expect(i && b && c, 'search input, button and first card').toBeTruthy();
  expect(Math.abs(i!.y - b!.y), 'input and button share a row').toBeLessThan(4);
  expect(Math.abs(i!.x - c!.x), 'row starts at the list edge').toBeLessThan(2);
  expect(
    Math.abs(b!.x + b!.width - (c!.x + c!.width)),
    'row ends at the list edge',
  ).toBeLessThan(2);
  expect(i!.width, 'input takes the rest of the row').toBeGreaterThan(
    c!.width - b!.width - 16,
  );
}

// 卡片按钮是否用了实心主样式（危险操作与主位都不允许）
export async function usesPrimaryStyling(el: Locator) {
  return el.evaluate((node) => {
    const btn = node.closest('button') ?? node;
    return (
      btn.classList.contains('ant-btn-primary') ||
      btn.classList.contains('ant-btn-variant-solid')
    );
  });
}

// 水合完成前点击无效，重试直到目标出现
export async function clickUntil(trigger: Locator, target: Locator) {
  await expect(async () => {
    await trigger.click();
    await expect(target).toBeVisible({ timeout: 2000 });
  }).toPass();
}

// 打开卡片的 ⋯ 菜单并返回它
export async function openMenu(page: Page, card: Locator) {
  const menu = page.locator('.ant-dropdown:not(.ant-dropdown-hidden)');
  await clickUntil(card.getByRole('button', { name: '更多操作' }), menu);
  return menu;
}

// 在 antd Select 里选择一项。
// - 只在未展开时点击：重复点击会把刚打开的下拉框又关掉；
// - 只在这个 Select 自己的下拉层（aria-controls 指向的列表）里找选项：
//   上一个 Select 的下拉层可能还在收起动画里，按类名全局查找会同时命中两个；
// - 列表重新渲染时下拉可能被收起，「打开 + 选择」整组重试。
export async function chooseOption(
  page: Page,
  combobox: Locator,
  label: string,
) {
  await expect(async () => {
    if ((await combobox.getAttribute('aria-expanded')) !== 'true') {
      await combobox.click();
    }
    await expect(combobox).toHaveAttribute('aria-expanded', 'true', {
      timeout: 2000,
    });
    const listId = await combobox.getAttribute('aria-controls');
    expect(listId, 'open Select points at its option list').toBeTruthy();
    await page
      .locator(`.ant-select-dropdown:has([id="${listId}"])`)
      .locator('.ant-select-item-option')
      .getByText(label, { exact: true })
      .click({ timeout: 3000 });
  }).toPass();
}
