/** @vitest-environment jsdom */
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';
import {
  SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS,
  useScriptAuditAIReview,
} from './useAIReviews';
import { aiReviewService } from '@/lib/api/services/aiReview';
import type { AIReviewDetail } from '@/lib/api/services/aiReview';

vi.mock('@/lib/api/services/aiReview', () => ({
  aiReviewService: {
    getAuditReview: vi.fn(),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ ...swrConfig, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
}

const review = (patch: Partial<AIReviewDetail> = {}): AIReviewDetail =>
  ({
    id: 7,
    script_id: 3,
    script_name: 'demo',
    script_code_id: 11,
    user_id: 1,
    status: 0,
    verdict: 0,
    attempts: 1,
    model: 'gpt-test',
    prompt_tokens: 0,
    completion_tokens: 0,
    latency_ms: 0,
    reason: '',
    summary: { zh: '', en: '' },
    tags: [],
    admin_note: '',
    createtime: 1700000000,
    updatetime: 1700000100,
    risk_signals: '[]',
    noisy_lines: '[]',
    last_error: '',
    script_audit_id: 99,
    ...patch,
  }) as AIReviewDetail;

describe('useScriptAuditAIReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('auditId 为 null 时不请求', () => {
    const { result } = renderHook(() => useScriptAuditAIReview(null), {
      wrapper,
    });
    expect(aiReviewService.getAuditReview).not.toHaveBeenCalled();
    expect(result.current.aiReview).toBeNull();
    expect(result.current.pollingStopped).toBe(false);
  });

  it('运行中每 2 秒轮询；达到上限后停止并报告 pollingStopped', async () => {
    vi.useFakeTimers();
    vi.mocked(aiReviewService.getAuditReview).mockResolvedValue({
      ai_review: review({ status: 0 }),
    });

    const { result, unmount } = renderHook(() => useScriptAuditAIReview(101), {
      wrapper,
    });

    // 首次请求
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.aiReview).not.toBeNull();

    // 再多推进 2 秒 × 上限次，保证越过封顶点
    for (let i = 0; i < SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS + 2; i += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
    }

    // 首次请求 + 轮询请求不会超过上限
    expect(aiReviewService.getAuditReview).toHaveBeenCalledTimes(
      SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS,
    );
    expect(result.current.pollingStopped).toBe(true);

    // 再推进一段时间，确认真的停了
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(aiReviewService.getAuditReview).toHaveBeenCalledTimes(
      SCRIPT_AUDIT_AI_REVIEW_MAX_POLLS,
    );
    unmount();
  });

  it('终态（status 1）后不再轮询', async () => {
    vi.useFakeTimers();
    vi.mocked(aiReviewService.getAuditReview).mockResolvedValue({
      ai_review: review({ status: 1 }),
    });
    const { result } = renderHook(() => useScriptAuditAIReview(102), {
      wrapper,
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.aiReview?.status).toBe(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(aiReviewService.getAuditReview).toHaveBeenCalledTimes(1);
    expect(result.current.pollingStopped).toBe(false);
  });

  it('refresh() 重新拉取', async () => {
    vi.mocked(aiReviewService.getAuditReview).mockResolvedValue({
      ai_review: review({ status: 1 }),
    });
    const { result } = renderHook(() => useScriptAuditAIReview(103), {
      wrapper,
    });
    await waitFor(() => expect(result.current.aiReview?.status).toBe(1));

    await act(async () => {
      result.current.refresh();
    });
    await waitFor(() =>
      expect(aiReviewService.getAuditReview).toHaveBeenCalledTimes(2),
    );
  });
});
