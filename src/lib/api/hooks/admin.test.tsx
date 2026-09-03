/** @vitest-environment jsdom */
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';
import { APIError } from '@/types/api';
import type { ListData } from '@/types/api';
import { useAdminList, useAdminUsers } from './admin';
import { adminService } from '@/lib/api/services/admin';

vi.mock('@/lib/api/services/admin', () => ({
  adminService: { listUsers: vi.fn() },
}));

/**
 * 用真实的全局 SWR 配置渲染，`keepPreviousData` 等行为才和线上一致；
 * 每个用例换一个 provider，避免上一条用例的缓存让下一条「一上来就有数据」。
 */
function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ ...swrConfig, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
}

function listOf<T>(list: T[], total = list.length): ListData<T> {
  return { list, total };
}

describe('useAdminList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 这条是这次改动的核心：旧写法 `useState(false)` 让首帧渲染出「暂无数据」，
  // 一拍之后才翻成转圈。首次渲染就必须是加载态。
  it('第一次渲染（还没有任何数据）就报告 isLoading', () => {
    const fetcher = vi.fn(
      () => new Promise<ListData<number>>(() => {}), // 永不 resolve
    );

    const { result } = renderHook(() => useAdminList(['t-pending'], fetcher), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.list).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('数据到达后给出 list / total 并退出加载态', async () => {
    const fetcher = vi.fn(async () => listOf([1, 2, 3], 42));

    const { result } = renderHook(() => useAdminList(['t-ok'], fetcher), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.list).toEqual([1, 2, 3]);
    expect(result.current.total).toBe(42);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('APIError 失败时暴露 error，调用方才能画重试而不是永久空表', async () => {
    const err = new APIError(500, 100001, 'boom');
    const fetcher = vi.fn(async () => {
      throw err;
    });

    const { result } = renderHook(() => useAdminList(['t-api-err'], fetcher), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error?.msg).toBe('boom');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.list).toEqual([]);
  });

  // 旧写法只在 `err instanceof APIError` 时提示，网络中断 / 20s 超时被整个吞掉，
  // 表格永久停在「暂无数据」且没有任何线索。
  it('非 APIError（网络中断 / 超时）同样进入 error，不被吞掉', async () => {
    const fetcher = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    const { result } = renderHook(() => useAdminList(['t-net-err'], fetcher), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.isLoading).toBe(false);
  });

  it('翻页时保留上一页数据：算 isRefreshing，不算 isLoading', async () => {
    const fetcher = vi.fn(async (page: number) => listOf([page]));

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) =>
        useAdminList(['t-page', page], () => fetcher(page)),
      { wrapper, initialProps: { page: 1 } },
    );

    await waitFor(() => expect(result.current.list).toEqual([1]));

    rerender({ page: 2 });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.list).toEqual([1]);

    await waitFor(() => expect(result.current.list).toEqual([2]));
    expect(result.current.isRefreshing).toBe(false);
  });

  it('refresh() 重新拉取当前 key', async () => {
    let n = 0;
    const fetcher = vi.fn(async () => listOf([(n += 1)]));

    const { result } = renderHook(() => useAdminList(['t-refresh'], fetcher), {
      wrapper,
    });

    await waitFor(() => expect(result.current.list).toEqual([1]));

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.list).toEqual([2]));
  });
});

describe('useAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('按 page / size / keyword 调用 adminService.listUsers', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue(listOf([], 0));

    const { result } = renderHook(
      () => useAdminUsers({ page: 2, size: 20, keyword: 'abc' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(adminService.listUsers).toHaveBeenCalledWith(2, 20, 'abc');
  });

  it('空关键词传 undefined，不把空串发给后端', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue(listOf([], 0));

    const { result } = renderHook(() => useAdminUsers({ page: 1 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(adminService.listUsers).toHaveBeenCalledWith(1, 20, undefined);
  });
});
