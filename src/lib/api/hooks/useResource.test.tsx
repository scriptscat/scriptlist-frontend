/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SWRResponse } from 'swr';
import { useResource } from './useResource';
import { APIError } from '@/types/api';

type Data = { list: number[] };

/** 构造一份 SWR 返回值，只覆盖测试关心的字段。 */
function swr(partial: Partial<SWRResponse<Data, APIError>>) {
  return {
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...partial,
  } as unknown as SWRResponse<Data, APIError>;
}

describe('useResource', () => {
  it('首次加载且无数据可画时 isInitialLoading 为 true', () => {
    const { result } = renderHook(() =>
      useResource(swr({ isLoading: true, isValidating: true })),
    );

    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('数据到手且不在重新验证时两个标记都为 false', () => {
    const data = { list: [1] };
    const { result } = renderHook(() => useResource(swr({ data })));

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.data).toBe(data);
  });

  // 这是 useResource 存在的理由：SWR 一旦拿到 fallbackData / initialData，
  // isLoading 就永远是 false，`if (isLoading)` 的调用方拿不到任何加载态。
  it('fallbackData 陷阱：isLoading 恒为 false 时仍能报告刷新中', () => {
    const fallback = { list: [] };
    const { result } = renderHook(() =>
      useResource(
        swr({ data: fallback, isLoading: false, isValidating: true }),
      ),
    );

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.data).toBe(fallback);
  });

  it('翻页 / 换筛选条件（旧数据仍在）算刷新，不算首屏加载', () => {
    const previous = { list: [1, 2, 3] };
    const { result } = renderHook(() =>
      useResource(swr({ data: previous, isLoading: true, isValidating: true })),
    );

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });

  it('显式声明 hasInitialData 时永远不会进入首屏加载态', () => {
    const { result } = renderHook(() =>
      useResource(swr({ isLoading: true, isValidating: true }), {
        hasInitialData: true,
      }),
    );

    expect(result.current.isInitialLoading).toBe(false);
  });

  it('key 变化后无数据可画时回到首屏加载态（isLoading 未置位也要认）', () => {
    const { result } = renderHook(() =>
      useResource(swr({ isLoading: false, isValidating: true })),
    );

    expect(result.current.isInitialLoading).toBe(true);
  });

  it('出错且无数据时透出 error，不再是加载态', () => {
    const error = new APIError(500, 500, 'boom');
    const { result } = renderHook(() =>
      useResource(swr({ error, isLoading: false, isValidating: false })),
    );

    expect(result.current.error).toBe(error);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('无请求（key 为 null）时不是加载态', () => {
    const { result } = renderHook(() => useResource(swr({})));

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });
});
