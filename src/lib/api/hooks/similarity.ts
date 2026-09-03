import { useCallback } from 'react';
import useSWR from 'swr';
import type { APIError } from '@/types/api';
import { similarityService } from '../services/similarity';
import type {
  IntegrityReviewItem,
  IntegrityWhitelistItem,
  PairDetail,
  PairWhitelistItem,
  SimilarPairItem,
  SuspectScriptItem,
} from '../services/similarity';
import { useResource } from './useResource';
import { ADMIN_PAGE_SIZE, useAdminList } from './admin';
import type { AdminListResult } from './admin';

// ==================== 相似对 ====================

export function useSimilarityPairs(params: {
  page: number;
  size?: number;
  excludeDeleted?: boolean;
}): AdminListResult<SimilarPairItem> {
  const { page, size = ADMIN_PAGE_SIZE, excludeDeleted = false } = params;
  return useAdminList(['similarity-pairs', page, size, excludeDeleted], () =>
    similarityService.listPairs({
      page,
      size,
      exclude_deleted: excludeDeleted || undefined,
    }),
  );
}

// ==================== 疑似脚本 ====================

export function useSimilaritySuspects(params: {
  page: number;
  size?: number;
}): AdminListResult<SuspectScriptItem> {
  const { page, size = ADMIN_PAGE_SIZE } = params;
  return useAdminList(['similarity-suspects', page, size], () =>
    similarityService.listSuspects({ page, size }),
  );
}

// ==================== 完整性复核 ====================

export function useIntegrityReviews(params: {
  page: number;
  size?: number;
}): AdminListResult<IntegrityReviewItem> {
  const { page, size = ADMIN_PAGE_SIZE } = params;
  return useAdminList(['similarity-integrity-reviews', page, size], () =>
    similarityService.listIntegrityReviews({ page, size }),
  );
}

// ==================== 完整性白名单 ====================

export function useIntegrityWhitelist(params: {
  page: number;
  size?: number;
}): AdminListResult<IntegrityWhitelistItem> {
  const { page, size = ADMIN_PAGE_SIZE } = params;
  return useAdminList(['similarity-integrity-whitelist', page, size], () =>
    similarityService.listIntegrityWhitelist({ page, size }),
  );
}

// ==================== 相似对白名单 ====================

export function usePairWhitelist(params: {
  page: number;
  size?: number;
}): AdminListResult<PairWhitelistItem> {
  const { page, size = ADMIN_PAGE_SIZE } = params;
  return useAdminList(['similarity-pair-whitelist', page, size], () =>
    similarityService.listPairWhitelist({ page, size }),
  );
}

// ==================== 相似对详情 ====================

export interface PairDetailResult {
  detail: PairDetail | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  error: APIError | undefined;
  refresh: () => void;
}

/**
 * 相似对详情。`source` 决定走管理端还是公开的取证接口
 * （`/similarity/pair/:id` 是任何人都能打开的公开路由）。
 */
export function usePairDetail(
  pairID: number,
  source: 'admin' | 'evidence',
): PairDetailResult {
  const swr = useSWR<{ detail: PairDetail }, APIError>(
    ['similarity-pair-detail', source, pairID],
    () =>
      source === 'admin'
        ? similarityService.getPairDetail(pairID)
        : similarityService.getEvidencePair(pairID),
  );
  const { data, isInitialLoading, isRefreshing, error } = useResource(swr);
  const { mutate } = swr;

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return {
    detail: data?.detail,
    isLoading: isInitialLoading,
    isRefreshing,
    error,
    refresh,
  };
}
