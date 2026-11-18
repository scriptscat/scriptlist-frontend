import { expect, test } from '@playwright/test';
import {
  addLoginCookies,
  expectNoHorizontalOverflow,
  MOBILE_VIEWPORT,
  useMobile,
} from './mobile';

const MENU = { name: '打开菜单' };

test.describe('mobile header drawer', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('header is compact and drawer shows every nav item', async ({
    page,
  }) => {
    await page.goto('/zh-CN/search', { waitUntil: 'networkidle' });
    expect(page.viewportSize()).toEqual(MOBILE_VIEWPORT);
    await expectNoHorizontalOverflow(page);

    const header = page.locator('[data-layout-header]');
    await expect(header.getByRole('button', MENU)).toBeVisible();
    // 主题 / 语言 / 发布脚本不再出现在窄屏头部
    await expect(header.getByRole('button', { name: '发布脚本' })).toBeHidden();
    await expect(header.locator('.anticon-global')).toBeHidden();
    await expect(header.locator('.ant-menu')).toBeHidden();

    await header.getByRole('button', MENU).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(header.getByRole('button', MENU)).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    for (const name of ['首页', '脚本列表', '社区', '浏览器扩展']) {
      await expect(drawer.getByRole('link', { name })).toBeVisible();
    }
    // spec：抽屉内依次是首页、脚本列表、社区、浏览器扩展
    await expect(drawer.locator('nav a')).toHaveText([
      '首页',
      '脚本列表',
      '社区',
      '浏览器扩展',
    ]);
    await expect(
      drawer.getByRole('link', { name: '脚本列表' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      drawer.getByRole('button', { name: /发布脚本/ }),
    ).toBeVisible();
    for (const label of ['浅色模式', '跟随系统', '深色模式']) {
      await expect(drawer.getByText(label)).toBeVisible();
    }
    await expect(
      drawer.getByRole('button', { name: /简体中文/ }),
    ).toBeVisible();
  });

  test('Esc closes the drawer and focus returns to the menu button', async ({
    page,
  }) => {
    await page.goto('/zh-CN/search', { waitUntil: 'networkidle' });
    const trigger = page
      .locator('[data-layout-header]')
      .getByRole('button', MENU);
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('clicking the mask or a nav link closes the drawer', async ({
    page,
  }) => {
    await page.goto('/zh-CN/search', { waitUntil: 'networkidle' });
    const trigger = page
      .locator('[data-layout-header]')
      .getByRole('button', MENU);
    await trigger.click();
    await page
      .locator('.ant-drawer-mask')
      .click({ position: { x: 20, y: 300 } });
    await expect(page.getByRole('dialog')).toBeHidden();

    await trigger.click();
    await page.getByRole('dialog').getByRole('link', { name: '首页' }).click();
    await expect(page).toHaveURL(/\/zh-CN\/?$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('appearance segment switches the theme', async ({ page }) => {
    await page.goto('/zh-CN/search', { waitUntil: 'networkidle' });
    await page
      .locator('[data-layout-header]')
      .getByRole('button', MENU)
      .click();
    await page.getByRole('dialog').getByText('深色模式').click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe('dark');
  });
});

test.describe('desktop header unchanged', () => {
  test('no hamburger, nav and theme/language visible', async ({ page }) => {
    await page.goto('/zh-CN/search', { waitUntil: 'networkidle' });
    const header = page.locator('[data-layout-header]');
    await expect(header.getByRole('button', MENU)).toBeHidden();
    await expect(header.locator('.ant-menu')).toBeVisible();
    await expect(header.locator('.anticon-global')).toBeVisible();
  });
});
