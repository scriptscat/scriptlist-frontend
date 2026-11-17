import { describe, expect, it } from 'vitest';
import { buildContentReportOriginHref, parseReportTab } from './reportTabs';

describe('parseReportTab', () => {
  it('content 进内容举报页签', () => {
    expect(parseReportTab('content')).toBe('content');
  });
  it('缺省 / 未知值回落到脚本举报', () => {
    expect(parseReportTab(undefined)).toBe('script');
    expect(parseReportTab('')).toBe('script');
    expect(parseReportTab('foo')).toBe('script');
    expect(parseReportTab('script')).toBe('script');
  });
});

describe('buildContentReportOriginHref', () => {
  it('评价 → 脚本评分页', () => {
    expect(
      buildContentReportOriginHref({
        target_type: 'score',
        script_id: 7,
        issue_id: 0,
        target_id: 3,
      }),
    ).toBe('/script-show-page/7/comment');
  });
  it('反馈 → 反馈详情', () => {
    expect(
      buildContentReportOriginHref({
        target_type: 'issue',
        script_id: 7,
        issue_id: 9,
        target_id: 9,
      }),
    ).toBe('/script-show-page/7/issue/9');
  });
  it('反馈回复 → 反馈详情锚点到回复', () => {
    expect(
      buildContentReportOriginHref({
        target_type: 'issue_comment',
        script_id: 7,
        issue_id: 9,
        target_id: 12,
      }),
    ).toBe('/script-show-page/7/issue/9#comment-12');
  });
});
