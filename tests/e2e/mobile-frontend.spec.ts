import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  addLoginCookies,
  expectNoHorizontalOverflow,
  useMobile,
} from './mobile';

const box = async (locator: Locator) => {
  const b = await locator.boundingBox();
  expect(b, 'element should have a box').not.toBeNull();
  return b!;
};

// 取包含脚本标题链接的最内层 antd 卡片（用户主页上外层还有卡片）。
function scriptCard(page: Page) {
  return page
    .getByRole('link', { name: 'E2E Userscript' })
    .first()
    .locator('xpath=ancestor::div[contains(@class,"ant-card")][1]');
}

test.describe('mobile ScriptCard', () => {
  useMobile(test);

  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('tags sit under the description and the footer stays on one row', async ({
    page,
  }) => {
    await page.goto('/zh-CN/search?sort=today_download', { waitUntil: 'load' });
    await expectNoHorizontalOverflow(page);

    const card = scriptCard(page);
    await expect(card).toBeVisible();
    const description = await box(card.getByTestId('script-card-description'));
    const tags = await box(
      card.locator('[data-testid="script-card-tags-mobile"]:visible'),
    );
    expect(tags.y).toBeGreaterThanOrEqual(description.y + description.height);
    await expect(
      card.locator('[data-testid="script-card-tags-desktop"]:visible'),
    ).toHaveCount(0);

    // 底栏：下载数 / 更新时间 / 分享同一行，不折行
    const stats = card.getByTestId('script-card-stats');
    const statsBox = await box(stats);
    expect(statsBox.height).toBeLessThanOrEqual(34);
    const items = await stats.locator('> *').all();
    const tops = await Promise.all(items.map(async (i) => (await box(i)).y));
    for (const y of tops) expect(Math.abs(y - tops[0])).toBeLessThanOrEqual(8);
    // 分享按钮贴右
    const share = await box(items[items.length - 1]);
    const cardBox = await box(card);
    expect(cardBox.x + cardBox.width - (share.x + share.width)).toBeLessThan(
      30,
    );
    // 标签在底栏之上
    expect(tags.y).toBeLessThan(statsBox.y);

    // 版本与作者并排，作者单行；今日安装另起一行
    const version = await box(
      card.locator('[data-testid="script-card-version-mobile"]:visible'),
    );
    const author = card.getByTestId('script-card-author');
    const authorBox = await box(author);
    expect(authorBox.height).toBeLessThanOrEqual(24);
    expect(Math.abs(version.y - authorBox.y)).toBeLessThanOrEqual(12);
    const today = await box(card.getByTestId('script-card-today'));
    expect(today.y).toBeGreaterThanOrEqual(authorBox.y + authorBox.height - 2);
  });

  test('user profile drops nested card chrome and keeps filters on one row', async ({
    page,
  }) => {
    await page.goto('/zh-CN/users/1', { waitUntil: 'load' });
    await expect(scriptCard(page)).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const wrapper = page.getByTestId('user-profile-content-card');
    const style = await wrapper.evaluate((el) => {
      const cs = getComputedStyle(el);
      const body = el.querySelector('.ant-card-body') as HTMLElement;
      return {
        border: cs.borderTopWidth,
        padding: getComputedStyle(body).paddingLeft,
      };
    });
    expect(style).toEqual({ border: '0px', padding: '0px' });

    const filter = page.getByTestId('user-script-filters');
    const fStyle = await filter.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { border: cs.borderTopWidth, padding: cs.paddingLeft };
    });
    expect(fStyle).toEqual({ border: '0px', padding: '0px' });

    const selects = await filter.locator('.ant-select').all();
    expect(selects.length).toBe(3);
    const ys = await Promise.all(selects.map(async (s) => (await box(s)).y));
    for (const y of ys) expect(Math.abs(y - ys[0])).toBeLessThanOrEqual(2);

    // 脚本卡片贴满内容宽度（视口 390，页面左右留白之外不再被嵌套吃掉）
    const card = await box(scriptCard(page));
    expect(card.width).toBeGreaterThanOrEqual(340);
  });
});

test.describe('desktop ScriptCard', () => {
  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('keeps the original footer layout', async ({ page }) => {
    await page.goto('/zh-CN/search?sort=today_download', { waitUntil: 'load' });
    const card = scriptCard(page);
    await expect(card).toBeVisible();
    const stats = await box(card.getByTestId('script-card-stats'));
    const tags = await box(
      card.locator('[data-testid="script-card-tags-desktop"]:visible'),
    );
    await expect(
      card.locator('[data-testid="script-card-tags-mobile"]:visible'),
    ).toHaveCount(0);
    expect(tags.x).toBeGreaterThan(stats.x + stats.width);
    expect(Math.abs(tags.y - stats.y)).toBeLessThanOrEqual(12);
    // 今日安装与作者同一行
    const author = await box(card.getByTestId('script-card-author'));
    const today = await box(card.getByTestId('script-card-today'));
    expect(Math.abs(today.y - author.y)).toBeLessThanOrEqual(8);
    await expect(
      card.locator('[data-testid="script-card-version-mobile"]:visible'),
    ).toHaveCount(0);
  });
});

test.describe('desktop user profile', () => {
  test.beforeEach(async ({ context }) => {
    await addLoginCookies(context);
  });

  test('keeps the card chrome and wrapped filters', async ({ page }) => {
    await page.goto('/zh-CN/users/1', { waitUntil: 'load' });
    await expect(scriptCard(page)).toBeVisible();

    const chrome = (testId: string) =>
      page.getByTestId(testId).evaluate((el) => {
        const cs = getComputedStyle(el);
        const body = getComputedStyle(
          el.querySelector('.ant-card-body') as HTMLElement,
        );
        return {
          border: cs.borderTopWidth,
          shadow: cs.boxShadow !== 'none',
          bg: cs.backgroundColor !== 'rgba(0, 0, 0, 0)',
          padding: body.paddingLeft,
        };
      });

    // 内容卡片：原本 shadow-lg + 24px 内边距（antd 的 1px 边框实际仍生效）
    expect(await chrome('user-profile-content-card')).toEqual({
      border: '1px',
      shadow: true,
      bg: true,
      padding: '24px',
    });
    // 筛选卡片：原本 1px 边框 + 背景 + 24px 内边距，无阴影
    expect(await chrome('user-script-filters')).toEqual({
      border: '1px',
      shadow: false,
      bg: true,
      padding: '24px',
    });

    // 筛选下拉仍是 Space wrap（不横向滚动），脚本卡片嵌在两层卡片内
    const filters = page.getByTestId('user-script-filters');
    const overflowX = await filters
      .locator('.ant-space-horizontal')
      .evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflowX).toBe('visible');
    expect(await filters.locator('.ant-select').count()).toBe(3);
    const content = await box(page.getByTestId('user-profile-content-card'));
    const card = await box(scriptCard(page));
    expect(content.width - card.width).toBeGreaterThanOrEqual(48);
  });
});
