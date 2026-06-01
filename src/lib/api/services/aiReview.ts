import { apiClient } from '../client';

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
  summary: string;
  tags: string[];
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
