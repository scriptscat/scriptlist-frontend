import { expect, test } from '@playwright/test';

// 脚本下架后，举报历史仍要对参与方与管理员开放。
//
// 这条路径只能用 e2e 覆盖：它成立与否取决于 `[id]/layout.tsx` 这个**服务端**
// layout 在 `/scripts/:id` 返回 404 时的行为，而 layout 不是纯函数、也进不了
// vitest。更要紧的是，它的失败方式很隐蔽——layout 若直接 `return children`
// 跳过 ScriptProvider，页面会在客户端抛 "useScript must be used within a
// ScriptProvider"，服务端渲染和类型检查都看不出来。
//
// 固定数据见 mock-api.ts：脚本 6240 的 `/scripts/6240` 返回 404（真实后端就是
// 这样，连脚本名都不给），举报 151 与它的评论仍返回 200。

const DELETED_SCRIPT = 6240;
const REPORT = 151;

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: 'e2e-token',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'login_id',
      value: '1',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
});

test.describe('脚本被删除后的举报详情', () => {
  test('举报正文与评论照常渲染，页面不因缺少脚本信息而崩溃', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.goto(
      `/zh-CN/script-show-page/${DELETED_SCRIPT}/report/${REPORT}`,
      { waitUntil: 'commit' },
    );

    await expect(
      page.getByText('这是脚本删除后的历史举报内容。'),
    ).toBeVisible();
    // 评论接口跟着脚本一起 404 的话，这里会停在「评论加载失败」上。
    await expect(page.getByText('我参与过这个举报。')).toBeVisible();

    // useScript() 缺少 Provider 时抛的错只在浏览器里可见。
    expect(
      pageErrors.map((error) => error.message),
      '举报详情页不应抛出运行时错误',
    ).toEqual([]);
  });

  test('脚本 404 的放行只针对举报详情，其余子路由仍是友好的 404 页', async ({
    page,
  }) => {
    await page.goto(`/zh-CN/script-show-page/${DELETED_SCRIPT}/version`, {
      waitUntil: 'commit',
    });

    // ErrorPage 的 404 文案；若放行范围过宽，这里会变成通用 error boundary。
    await expect(page.getByText('页面未找到')).toBeVisible();
  });

  test('脚本本身的详情页同样保持 404，不被举报的放行规则带出来', async ({
    page,
  }) => {
    await page.goto(`/zh-CN/script-show-page/${DELETED_SCRIPT}`, {
      waitUntil: 'commit',
    });

    await expect(page.getByText('页面未找到')).toBeVisible();
  });
});
