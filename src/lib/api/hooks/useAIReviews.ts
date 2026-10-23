import { useCallback } from 'react';
import useSWR from 'swr';
import type { APIError } from '@/types/api';
import {
  type AIReviewDetail,
  type AIReviewListResponse,
  type FullScanStatus,
  aiReviewService,
} from '../services/aiReview';

/** 运行中的 AI 审核结论轮询间隔 */
export const SCRIPT_AUDIT_AI_REVIEW_POLL_INTERVAL_MS = 2000;
/** 轮询次数上限：90 次 × 2s ≈ 3 分钟，用尽后停止轮询，交给用户手动刷新 */
export const SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS = 90;

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

/**
 * 单条审核记录的「已轮询次数」。
 *
 * 存在模块级而不是组件里：审核详情抽屉和结论卡用同一个 SWR key 各订阅一次，
 * 局部计数器会各算各的，既可能提前触发 3 分钟超时，也可能一方封顶后另一方还在请求。
 * 请求本身被 SWR 按 key 去重，所以这里的计数就是真实发出的请求数。
 *
 * `reviewId` 变化代表出现了新的审核任务（例如刚提交了重审），计数从头开始。
 */
const pollState = new Map<number, { reviewId: number | null; count: number }>();

function recordPoll(auditId: number, reviewId: number | null): number {
  const prev = pollState.get(auditId);
  const count = !prev || prev.reviewId !== reviewId ? 1 : prev.count + 1;
  pollState.set(auditId, { reviewId, count });
  return count;
}

const scriptAuditAIReviewKey = (auditId: number) =>
  ['script-audit-ai-review', auditId] as const;

/** 结论卡的 SWR key，父组件可用它 `mutate` 来手动刷新卡片 */
export { scriptAuditAIReviewKey };

/** 重置某条审核记录的轮询计数，让新提交的审核重新计 3 分钟 */
export function resetScriptAuditAIReviewPolling(auditId: number) {
  pollState.delete(auditId);
}

interface ScriptAuditAIReviewData {
  ai_review: AIReviewDetail | null;
  /**
   * 本次是第几次轮询。放进 data 里而不是只留在模块级计数中，
   * 是为了让每次请求的返回值都不同 —— 否则结论没变时 SWR 会做深度比较并跳过重渲染，
   * 封顶后的「停止轮询 + 提示超时」就永远画不出来。
   */
  polls: number;
}

export interface ScriptAuditAIReviewResult {
  /** 该审核记录对应代码版本的最新 AI 审核结论，null 表示还没有记录 */
  aiReview: AIReviewDetail | null;
  isLoading: boolean;
  error: APIError | undefined;
  /** 轮询次数用尽仍未到终态，需要提示用户手动刷新 */
  pollingStopped: boolean;
  /** 立即重新拉取，同时重置轮询计数、让轮询重新开始 */
  refresh: () => void;
}

/**
 * 单条脚本审核记录对应的 AI 审核结论。
 *
 * 运行中（`status === 0`）每 2 秒轮询，到终态后自动停止；
 * 轮询次数上限为 {@link SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS}，用尽后
 * `pollingStopped` 置真、间隔归零，由组件提示「获取超时，请手动刷新」。
 */
export function useScriptAuditAIReview(
  auditId: number | null,
): ScriptAuditAIReviewResult {
  const fetchReview =
    useCallback(async (): Promise<ScriptAuditAIReviewData> => {
      if (auditId === null) return { ai_review: null, polls: 0 };
      const res = await aiReviewService.getAuditReview(auditId);
      return {
        ai_review: res.ai_review ?? null,
        polls: recordPoll(auditId, res.ai_review?.id ?? null),
      };
    }, [auditId]);

  const { data, isLoading, error, mutate } = useSWR<
    ScriptAuditAIReviewData,
    APIError
  >(
    // null key：没有 auditId 时不发请求
    auditId === null ? null : scriptAuditAIReviewKey(auditId),
    fetchReview,
    {
      // 只在运行中轮询；到终态、轮询封顶后归零。
      // 次数在 fetcher 里累加并随 data 返回，所以封顶后的重渲染会看到 polls = 上限，
      // 间隔在这里从 2000 变成 0，SWR 的轮询 effect 随之重启并停掉定时器。
      refreshInterval: (latest) =>
        (latest?.polls ?? 0) < SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS &&
        latest?.ai_review?.status === 0
          ? SCRIPT_AUDIT_AI_REVIEW_POLL_INTERVAL_MS
          : 0,
    },
  );

  const refresh = useCallback(() => {
    // 清掉计数，让新提交的审核从头开始轮询
    if (auditId !== null) pollState.delete(auditId);
    void mutate();
  }, [auditId, mutate]);

  return {
    aiReview: data?.ai_review ?? null,
    isLoading,
    error,
    pollingStopped: (data?.polls ?? 0) >= SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS,
    refresh,
  };
}
