import type { SWRResponse } from 'swr';
import type { APIError } from '@/types/api';

export interface UseResourceOptions {
  /**
   * 调用方给 SWR 传了 `fallbackData` / `initialData`（通常来自 SSR）。
   *
   * 这种情况下 SWR 的 `isLoading` 永远是 `false`，且首屏一定有东西可画，
   * 显式声明后 `isInitialLoading` 恒为 `false`，调用方不必再自己判断。
   */
  hasInitialData?: boolean;
}

export interface UseResourceResult<T> {
  data: T | undefined;
  /** 只有「屏幕上没有任何东西可画」时才为 true —— 该渲染骨架 / 占位的时刻。 */
  isInitialLoading: boolean;
  /** 已有数据，但正在后台取新数据（翻页、换筛选、revalidate）—— 该渲染轻量的刷新指示。 */
  isRefreshing: boolean;
  error: APIError | undefined;
}

/**
 * 把 SWR 的返回值归一成「画什么」的语义。
 *
 * 存在的原因：SWR 拿到 `fallbackData` / `initialData` 之后 `isLoading` 永远是
 * `false`，写 `if (isLoading)` 的调用方永远等不到加载态；于是各处出现了
 * `const loading = paramsChanged && isLoading` 这类手搓变通，同一件事有好几种写法。
 * 这里统一成两个互斥的问题：屏幕上是空的吗（`isInitialLoading`）？
 * 屏幕上有旧数据但正在刷新吗（`isRefreshing`）？
 *
 * 本身不调用任何 React Hook，是对 SWR 返回值的纯推导；以 `use` 开头是为了
 * 与调用处的 hook 语义保持一致。
 */
export function useResource<T>(
  swr: SWRResponse<T, APIError>,
  opts?: UseResourceOptions,
): UseResourceResult<T> {
  const { data, error, isLoading, isValidating } = swr;
  const hasData = data !== undefined;

  // 有 fallbackData 时首屏一定有东西可画，直接短路，不看 isLoading。
  const isInitialLoading = opts?.hasInitialData
    ? false
    : !hasData && !error && (isLoading || isValidating);

  return {
    data,
    isInitialLoading,
    isRefreshing: isValidating && hasData,
    error: error ?? undefined,
  };
}
