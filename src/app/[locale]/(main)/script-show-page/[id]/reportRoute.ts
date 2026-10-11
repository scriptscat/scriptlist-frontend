/**
 * 举报详情是脚本详情下唯一一条「脚本被删除后仍然可读」的子路由：后端对已删除脚本
 * 的 `/scripts/:id` 一律 404，但举报历史对参与方与管理员保留。
 *
 * 脚本详情 layout 靠这个判断决定 404 时是整页报错还是把渲染让给子路由——放宽到
 * 整个 `[id]` 子树的话，随便一个不存在的脚本 id 都会绕过友好的 404 页。
 */
const REPORT_DETAIL_PATTERN = /\/script-show-page\/\d+\/report\/\d+\/?$/;

export function isReportDetailPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) {
    return false;
  }
  return REPORT_DETAIL_PATTERN.test(pathname);
}
