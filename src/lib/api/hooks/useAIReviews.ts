import useSWR from 'swr';
import type { APIError } from '@/types/api';
import {
  type AIReviewListResponse,
  type FullScanStatus,
  aiReviewService,
} from '../services/aiReview';

/**
 * AI 审核记录列表
 */
export function useAIReviews(params: Record<string, unknown>) {
  return useSWR<AIReviewListResponse, APIError>(['ai-reviews', params], () =>
    aiReviewService.listRecords(params),
  );
}

/**
 * 全站扫描状态轮询
 */
export function useFullScanStatus(refreshIntervalMs = 5000) {
  return useSWR<FullScanStatus, APIError>(
    ['ai-review:fullscan'],
    () => aiReviewService.getFullScanStatus(),
    {
      refreshInterval: refreshIntervalMs,
    },
  );
}
