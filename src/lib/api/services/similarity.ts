import type { ListData } from '@/types/api';
import { apiClient } from '../client';

export interface ScriptBrief {
  id: number;
  name: string;
  user_id: number;
  username: string;
  public: number;
  createtime: number;
}

export interface ScriptFullInfo extends ScriptBrief {
  script_code_id: number;
  version: string;
  code_created_at: number;
}

export interface TopSource {
  script_id: number;
  script_name: string;
  jaccard: number;
  contribution_pct: number;
}

export interface MatchSegment {
  a_start: number;
  a_end: number;
  b_start: number;
  b_end: number;
}

export interface SimilarPairItem {
  id: number;
  script_a: ScriptBrief;
  script_b: ScriptBrief;
  jaccard: number;
  common_count: number;
  earlier_side: 'A' | 'B' | 'same';
  status: number;
  detected_at: number;
  integrity_score?: number;
}

export interface SuspectScriptItem {
  script: ScriptBrief;
  max_jaccard: number;
  coverage: number;
  top_sources: TopSource[];
  pair_count: number;
  detected_at: number;
  integrity_score?: number;
}

export interface AdminActions {
  can_whitelist: boolean;
}

export interface PairDetail {
  id: number;
  script_a: ScriptFullInfo;
  script_b: ScriptFullInfo;
  jaccard: number;
  common_count: number;
  a_fp_count: number;
  b_fp_count: number;
  earlier_side: 'A' | 'B' | 'same';
  detected_at: number;
  code_a: string;
  code_b: string;
  match_segments: MatchSegment[];
  status?: number;
  review_note?: string;
  admin_actions?: AdminActions;
}

export interface IntegritySubScores {
  cat_a: number;
  cat_b: number;
  cat_c: number;
  cat_d: number;
}

export interface IntegrityHitSignal {
  name: string;
  value: number;
  threshold: number;
}

export interface IntegrityReviewItem {
  id: number;
  script: ScriptBrief;
  script_code_id: number;
  score: number;
  status: number;
  createtime: number;
}

export interface IntegrityReviewDetail extends IntegrityReviewItem {
  sub_scores: IntegritySubScores;
  hit_signals: IntegrityHitSignal[];
  code: string;
  reviewed_by?: number;
  reviewed_at?: number;
  review_note?: string;
}

export interface IntegrityWhitelistItem {
  id: number;
  script: ScriptBrief;
  reason: string;
  added_by: number;
  added_by_name: string;
  createtime: number;
}

export interface PairWhitelistItem {
  id: number;
  script_a: ScriptBrief;
  script_b: ScriptBrief;
  reason: string;
  added_by: number;
  added_by_name: string;
  createtime: number;
}

class SimilarityService {
  private readonly adminBase = '/admin/similarity';
  private readonly publicBase = '/similarity';

  listPairs(params: {
    page?: number;
    size?: number;
    status?: number;
    min_jaccard?: number;
    script_id?: number;
  }) {
    return apiClient.get<ListData<SimilarPairItem>>(
      `${this.adminBase}/pairs`,
      params,
    );
  }

  listSuspects(params: {
    page?: number;
    size?: number;
    min_jaccard?: number;
    min_coverage?: number;
    status?: number;
  }) {
    return apiClient.get<ListData<SuspectScriptItem>>(
      `${this.adminBase}/suspects`,
      params,
    );
  }

  getPairDetail(id: number) {
    return apiClient.get<{ detail: PairDetail }>(
      `${this.adminBase}/pairs/${id}`,
    );
  }

  addPairWhitelist(id: number, reason: string) {
    return apiClient.post<void>(`${this.adminBase}/pairs/${id}/whitelist`, {
      reason,
    });
  }

  removePairWhitelist(id: number) {
    return apiClient.delete<void>(`${this.adminBase}/pairs/${id}/whitelist`);
  }

  listPairWhitelist(params: { page?: number; size?: number }) {
    return apiClient.get<ListData<PairWhitelistItem>>(
      `${this.adminBase}/whitelist`,
      params,
    );
  }

  listIntegrityReviews(params: {
    page?: number;
    size?: number;
    status?: number;
  }) {
    return apiClient.get<ListData<IntegrityReviewItem>>(
      `${this.adminBase}/integrity/reviews`,
      params,
    );
  }

  getIntegrityReview(id: number) {
    return apiClient.get<{ detail: IntegrityReviewDetail }>(
      `${this.adminBase}/integrity/reviews/${id}`,
    );
  }

  resolveIntegrityReview(id: number, status: 1 | 2, note: string) {
    return apiClient.post<void>(
      `${this.adminBase}/integrity/reviews/${id}/resolve`,
      { status, note },
    );
  }

  listIntegrityWhitelist(params: { page?: number; size?: number }) {
    return apiClient.get<ListData<IntegrityWhitelistItem>>(
      `${this.adminBase}/integrity/whitelist`,
      params,
    );
  }

  addIntegrityWhitelist(script_id: number, reason: string) {
    return apiClient.post<void>(`${this.adminBase}/integrity/whitelist`, {
      script_id,
      reason,
    });
  }

  removeIntegrityWhitelist(scriptID: number) {
    return apiClient.delete<void>(
      `${this.adminBase}/integrity/whitelist/${scriptID}`,
    );
  }

  getEvidencePair(id: number) {
    return apiClient.get<{ detail: PairDetail }>(
      `${this.publicBase}/pair/${id}`,
    );
  }
}

export const similarityService = new SimilarityService();
