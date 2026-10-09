import type { ContentReportTargetType } from '@/types/api';

export const TARGET_TYPE_COLORS: Record<ContentReportTargetType, string> = {
  score: 'blue',
  issue: 'purple',
  issue_comment: 'cyan',
};

/** 1 待处理 | 2 已处理 | 3 已驳回 */
export const REPORT_STATUS_COLORS: Record<number, string> = {
  1: 'error',
  2: 'success',
  3: 'default',
};
