import useSWR from 'swr';
import { APIError } from '@/types/api';
import { apiClient, RequestOptions } from '../client';

/**
 * 通用API请求Hook
 * @param path - API路径
 * @param config - 请求配置
 * @returns SWR返回值
 */
export function useRequest<T>(path: string, config: RequestOptions = {}) {
  return useSWR<T, APIError>(
    [path, config],
    ([path, config]: [string, RequestOptions]) =>
      apiClient.request<T>(path, config),
  );
}
