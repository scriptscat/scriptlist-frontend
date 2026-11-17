import type { AdminContentReportItem } from '@/types/api';

export type ReportTab = 'script' | 'content';

/** `?tab=content` 进内容举报；缺省或未知值回落到脚本举报。 */
export function parseReportTab(tab: string | undefined): ReportTab {
  return tab === 'content' ? 'content' : 'script';
}

/** 「在原位置查看」链接：评价 → 评分页，反馈 → 反馈详情，回复 → 反馈详情内锚点。 */
export function buildContentReportOriginHref(
  item: Pick<
    AdminContentReportItem,
    'target_type' | 'script_id' | 'issue_id' | 'target_id'
  >,
): string {
  const base = `/script-show-page/${item.script_id}`;
  switch (item.target_type) {
    case 'score':
      return `${base}/comment`;
    case 'issue':
      return `${base}/issue/${item.issue_id}`;
    case 'issue_comment':
      return `${base}/issue/${item.issue_id}#comment-${item.target_id}`;
  }
}
