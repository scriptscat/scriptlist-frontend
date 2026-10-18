import type { ContentReportHandleBody } from '@/types/api';

export type DrawerAction = 'reject' | 'resolve' | 'delete' | 'reopen';

/** 处理备注长度上限，与后端 `note` 校验一致。 */
export const CONTENT_REPORT_NOTE_MAX = 500;

/** 待处理（status=1）给出三个处理动作；已结案（已处理 / 已驳回）只能重新打开。 */
export function drawerActionsFor(status: number): DrawerAction[] {
  return status === 1 ? ['reject', 'resolve', 'delete'] : ['reopen'];
}

/** 处理请求体：备注去首尾空白，空白则不发送。 */
export function buildHandleBody(
  action: ContentReportHandleBody['action'],
  note: string,
): ContentReportHandleBody {
  const trimmed = note.trim();
  return trimmed ? { action, note: trimmed } : { action };
}
