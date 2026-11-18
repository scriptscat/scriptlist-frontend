import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import {
  expectNoHorizontalOverflow,
  MOBILE_VIEWPORT,
  useMobile,
} from './mobile';

const DETAIL = '/zh-CN/script-show-page/1';
// mock 脚本（tests/e2e/mock-api.ts）：score 5 / score_num 1、today_install 3、
// total_install 120、v1.0.0、作者 e2e-user、关注 / 收藏计数 0。
const HEADER = '[data-testid="script-mobile-header"]';
// 原头部卡的标题是 antd Title（简介 markdown 里也有同名 h2，需区分）。
const DESKTOP_TITLE = 'h2.ant-typography';

async function openDetail(page: Page) {
  await page.goto(DETAIL, { waitUntil: 'commit' });
  await expect(page.locator('.markdown-body')).toBeVisible();
}

// 详情页导航（antd Menu）在水合后才测量并收起溢出项，之前的一瞬会撑宽页面，
// 所以横向溢出检查等页面稳定后再判断。
async function expectNoOverflowOnceSettled(page: Page) {
  await expect(() => expectNoHorizontalOverflow(page)).toPass();
}

// 元素整个落在所在按钮里，且自身没有被压缩 / 截断（scrollWidth ≤ clientWidth）。
async function measureInButton(span: Locator) {
  return span.evaluate((el) => {
    const b = el.closest('button')!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      text: el.textContent,
      scroll: el.scrollWidth,
      client: el.clientWidth,
      inside: r.left >= b.left - 0.5 && r.right <= b.right + 0.5,
    };
  });
}

test.describe('script detail header at 390px (scheme B)', () => {
  useMobile(test);

  test('header carries rating, version, author, installs and both dates', async ({
    page,
  }) => {
    await openDetail(page);
    expect(page.viewportSize()).toEqual(MOBILE_VIEWPORT);

    const header = page.locator(HEADER);
    await expect(header).toBeVisible();
    await expect(
      header.getByRole('heading', { name: 'E2E Userscript' }),
    ).toBeVisible();
    await expect(header.getByTestId('mobile-header-rating')).toHaveText(/0\.5/);
    await expect(header.getByText('v1.0.0')).toBeVisible();
    await expect(header.getByRole('link', { name: /e2e-user/ })).toBeVisible();
    await expect(header.getByTestId('mobile-header-today')).toHaveText(
      /近 24 小时\s*\+3/,
    );
    const footer = header.getByTestId('mobile-header-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('120');
    await expect(footer).toContainText('总安装量');
    await expect(footer).toContainText('更新于');
    await expect(footer).toContainText('创建于');

    // 桌面头部与单独的「数据统计」卡在窄屏都不显示
    await expect(
      page.getByText('数据统计').filter({ visible: true }),
    ).toHaveCount(0);
    await expect(
      page
        .locator(DESKTOP_TITLE, { hasText: 'E2E Userscript' })
        .filter({ visible: true }),
    ).toHaveCount(0);

    await expectNoOverflowOnceSettled(page);
  });

  test('a long description is clamped to 3 lines and can expand / collapse', async ({
    page,
  }) => {
    await openDetail(page);
    const header = page.locator(HEADER);
    const desc = header.getByTestId('mobile-header-description');
    const expand = header.getByRole('button', { name: '展开' });
    await expect(desc).toBeVisible();
    // mock 的简介只有一行：换成一段很长的简介，让真实的 3 行截断生效。
    // 水合可能把注入的文字换回去，所以注入与断言一起重试。
    await expect(async () => {
      await desc.evaluate((el) => {
        el.textContent =
          '这是一段很长的脚本简介，用来验证窄屏头部的三行截断。'.repeat(12);
      });
      await expect(expand).toBeVisible({ timeout: 2_000 });
    }).toPass();
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    const clamped = await desc.evaluate((el) => ({
      scroll: el.scrollHeight,
      client: el.clientHeight,
    }));
    expect(clamped.scroll).toBeGreaterThan(clamped.client);

    await expand.click();
    const collapse = header.getByRole('button', { name: '收起' });
    await expect(collapse).toHaveAttribute('aria-expanded', 'true');
    const expanded = await desc.evaluate((el) => ({
      scroll: el.scrollHeight,
      client: el.clientHeight,
    }));
    expect(expanded.scroll).toBeLessThanOrEqual(expanded.client);
    expect(expanded.client).toBeGreaterThan(clamped.client);

    await collapse.click();
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    const reclamped = await desc.evaluate((el) => el.clientHeight);
    expect(reclamped).toBe(clamped.client);
    await expectNoOverflowOnceSettled(page);
  });

  test('关注 / 收藏 labels and counts stay fully visible', async ({ page }) => {
    await openDetail(page);
    const watch = page.getByRole('button', { name: /关注/ });
    const favorite = page.getByRole('button', { name: /收藏/ });
    await expect(watch).toBeVisible();
    await expect(favorite).toBeVisible();

    // mock 的计数是 0；换成线上出问题时的计数（关注 160、收藏 129，见 spec 问题 6）。
    const cases = [
      { button: watch, label: '关注', count: '160' },
      { button: favorite, label: '收藏', count: '129' },
    ];
    await expect(async () => {
      for (const { button, label, count } of cases) {
        const countSpan = button.locator('span', { hasText: /^\d+$/ });
        await countSpan.evaluate((el, c) => (el.textContent = c), count);
        const labelSpan = button.locator('span', {
          hasText: new RegExp(`^${label}$`),
        });
        const l = await measureInButton(labelSpan);
        const c = await measureInButton(countSpan);
        expect(c.text, `${label} count still injected`).toBe(count);
        expect(l.scroll, `${label} label scrollWidth`).toBeLessThanOrEqual(
          l.client,
        );
        expect(l.inside, `${label} label inside its button`).toBe(true);
        expect(c.inside, `${label} count inside its button`).toBe(true);
      }
    }).toPass({ timeout: 15_000 });
    await expectNoOverflowOnceSettled(page);
  });
});

test.describe('script detail header at desktop width', () => {
  test('keeps the original header and the sidebar stats card', async ({
    page,
  }) => {
    await openDetail(page);
    expect(page.viewportSize()!.width).toBeGreaterThanOrEqual(1024);

    await expect(page.locator(HEADER).filter({ visible: true })).toHaveCount(0);
    await expect(
      page.locator(DESKTOP_TITLE, { hasText: 'E2E Userscript' }),
    ).toBeVisible();
    await expect(
      page.getByText(/创建于/).filter({ visible: true }),
    ).toHaveCount(1);
    await expect(
      page.getByText('数据统计').filter({ visible: true }),
    ).toHaveCount(1);
    await expect(
      page.getByText('总安装量').filter({ visible: true }),
    ).toHaveCount(1);
  });
});
