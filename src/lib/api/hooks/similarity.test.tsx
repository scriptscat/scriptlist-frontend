/** @vitest-environment jsdom */
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';
import { APIError } from '@/types/api';
import { similarityService } from '@/lib/api/services/similarity';
import { usePairDetail, useSimilarityPairs } from './similarity';

vi.mock('@/lib/api/services/similarity', () => ({
  similarityService: {
    listPairs: vi.fn(),
    getPairDetail: vi.fn(),
    getEvidencePair: vi.fn(),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ ...swrConfig, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
}

describe('useSimilarityPairs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('首帧就是加载态，而不是先画一次空表', async () => {
    vi.mocked(similarityService.listPairs).mockReturnValue(
      new Promise(() => {}) as never,
    );

    const { result } = renderHook(() => useSimilarityPairs({ page: 1 }), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.list).toEqual([]);
  });

  it('exclude_deleted 关闭时不发这个参数', async () => {
    vi.mocked(similarityService.listPairs).mockResolvedValue({
      list: [],
      total: 0,
    });

    const { result } = renderHook(
      () => useSimilarityPairs({ page: 1, excludeDeleted: false }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(similarityService.listPairs).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      exclude_deleted: undefined,
    });
  });
});

describe('usePairDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('source=evidence 走公开接口', async () => {
    vi.mocked(similarityService.getEvidencePair).mockResolvedValue({
      detail: { id: 7 } as never,
    });

    const { result } = renderHook(() => usePairDetail(7, 'evidence'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.detail).toBeDefined());
    expect(similarityService.getEvidencePair).toHaveBeenCalledWith(7);
    expect(similarityService.getPairDetail).not.toHaveBeenCalled();
  });

  it('source=admin 走管理接口', async () => {
    vi.mocked(similarityService.getPairDetail).mockResolvedValue({
      detail: { id: 8 } as never,
    });

    const { result } = renderHook(() => usePairDetail(8, 'admin'), { wrapper });

    await waitFor(() => expect(result.current.detail).toBeDefined());
    expect(similarityService.getPairDetail).toHaveBeenCalledWith(8);
  });

  // 旧实现是 `if (!detail) return null`：取数失败时整页空白，只有 3 秒 toast。
  // hook 必须把失败暴露出来，页面才能画错误态 + 重试。
  it('失败时 error 可见且 detail 为空，页面据此画错误态', async () => {
    vi.mocked(similarityService.getEvidencePair).mockRejectedValue(
      new APIError(404, 114001, 'not found'),
    );

    const { result } = renderHook(() => usePairDetail(9, 'evidence'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.detail).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});
