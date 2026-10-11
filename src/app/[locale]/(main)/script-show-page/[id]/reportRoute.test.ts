import { describe, expect, it } from 'vitest';
import { isReportDetailPath } from './reportRoute';

describe('isReportDetailPath', () => {
  it.each([
    '/zh-CN/script-show-page/6240/report/151',
    '/en/script-show-page/1/report/2/',
    '/script-show-page/10/report/20',
  ])('把举报详情识别为可越过脚本 404 的路由: %s', (pathname) => {
    expect(isReportDetailPath(pathname)).toBe(true);
  });

  it.each([
    // 举报列表不在放行范围内：已删除脚本的举报列表不对外开放
    '/zh-CN/script-show-page/6240/report',
    '/zh-CN/script-show-page/6240/report/create',
    '/zh-CN/script-show-page/6240',
    '/zh-CN/script-show-page/6240/version',
    '/zh-CN/script-show-page/6240/issue/1',
    '/zh-CN/scripts',
  ])('其余路由继续走整页 404: %s', (pathname) => {
    expect(isReportDetailPath(pathname)).toBe(false);
  });

  it('拿不到 pathname 时保守处理，不放行', () => {
    expect(isReportDetailPath(null)).toBe(false);
    expect(isReportDetailPath(undefined)).toBe(false);
    expect(isReportDetailPath('')).toBe(false);
  });
});
