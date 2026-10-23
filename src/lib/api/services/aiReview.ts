import { apiClient } from '../client';
import type { LocalizedSummary } from '@/types/api';

export type AIReviewStatus = 0 | 1 | 2 | 3 | 4 | 5;
export type AIVerdict = 0 | 1 | 2 | 3;

export interface AIReviewItem {
  id: number;
  script_id: number;
  script_name: string;
  script_code_id: number;
  user_id: number;
  status: AIReviewStatus;
  verdict: AIVerdict;
  attempts: number;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  reason: string;
  summary: LocalizedSummary;
  tags: string[];
  /** 管理员在重审时填写的补充说明，会写入提示词 */
  admin_note: string;
  createtime: number;
  updatetime: number;
}

export interface AIReviewDetail extends AIReviewItem {
  risk_signals: string;
  noisy_lines: string;
  last_error: string;
  script_audit_id: number;
}

export interface FullScanStatus {
  running: boolean;
  total: number;
  processed: number;
  last_id: number;
  start_id: number;
  end_id: number;
  limit: number;
  started_at: number;
  updated_at: number;
  recent_errs: string[];
}

export interface AIReviewListResponse {
  list: AIReviewItem[];
  total: number;
}

export interface AIReviewStatsResponse {
  since: number;
  counts: Record<string, number>;
  total: number;
}

export interface TriggerScriptReviewResponse {
  script_id: number;
  script_code_id: number;
}

export interface TriggerAuditReviewResponse {
  ai_review_id: number;
  script_id: number;
  script_code_id: number;
}

export interface FullScanScope {
  start_id?: number;
  end_id?: number;
  limit?: number;
}

class AIReviewService {
  private readonly basePath = '/admin/ai-review';

  triggerFullScan(
    reset: boolean,
    onlyMissing: boolean,
    scope: FullScanScope = {},
  ) {
    return apiClient.post<{ queued_from: number }>(
      `${this.basePath}/full-scan`,
      {
        reset,
        only_missing: onlyMissing,
        ...scope,
      },
    );
  }

  cancelFullScan() {
    return apiClient.delete<unknown>(`${this.basePath}/full-scan`);
  }

  triggerScriptReview(scriptId: number) {
    return apiClient.post<TriggerScriptReviewResponse>(
      `${this.basePath}/scripts/${scriptId}/run`,
    );
  }

  /**
   * 针对某条脚本审核记录（对应一个代码版本）重新调用 AI 审核。
   * `note` 会作为「管理员补充说明」写入提示词，留空提交则清除上一次的说明。
   */
  triggerAuditReview(auditId: number, note?: string) {
    return apiClient.post<TriggerAuditReviewResponse>(
      `${this.basePath}/audits/${auditId}/run`,
      note ? { note } : {},
    );
  }

  /** 查询某条脚本审核记录最新的 AI 审核结论 */
  getAuditReview(auditId: number) {
    return apiClient.get<{ ai_review: AIReviewDetail | null }>(
      `${this.basePath}/audits/${auditId}`,
    );
  }

  getFullScanStatus() {
    return apiClient.get<FullScanStatus>(`${this.basePath}/full-scan/status`);
  }

  listRecords(params: Record<string, unknown>) {
    return apiClient.get<AIReviewListResponse>(
      `${this.basePath}/records`,
      params,
    );
  }

  getRecord(id: number) {
    return apiClient.get<AIReviewDetail>(`${this.basePath}/records/${id}`);
  }

  getStats(days: number) {
    return apiClient.get<AIReviewStatsResponse>(`${this.basePath}/stats`, {
      days,
    });
  }
}

export const aiReviewService = new AIReviewService();
