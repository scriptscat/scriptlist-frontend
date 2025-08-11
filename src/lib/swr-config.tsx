'use client';
import { SWRConfig } from 'swr';
import { APIError } from '@/types/api';

/**
 * SWR 全局配置
 */
export const swrConfig = {
  // 错误重试配置
  errorRetryCount: 3,
  errorRetryInterval: 1000,

  // 缓存配置
  dedupingInterval: 2000, // 2秒内的重复请求会被去重
  focusThrottleInterval: 5000, // 窗口聚焦时的节流间隔

  // 默认的 revalidate 行为
  revalidateOnFocus: false, // 窗口聚焦时不自动重新验证
  revalidateOnReconnect: true, // 网络重连时重新验证
  revalidateIfStale: true, // 数据过期时重新验证

  // 错误处理
  onError: (error: any) => {
    console.error('SWR Error:', error);

    // 可以在这里添加全局错误处理逻辑
    // 比如显示通知、记录日志等
    if (error instanceof APIError) {
      // 处理 API 错误
      console.error(`API Error ${error.code}: ${error.message}`);
    }
  },

  // 成功回调
  onSuccess: (data: any, key: string) => {
    // 可以在这里添加成功后的处理逻辑
    // console.log('SWR Success:', key, data);
  },
};

/**
 * SWR Provider 组件的属性
 */
export const swrProviderValue = {
  ...swrConfig,
};

export const SWRProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <SWRConfig value={swrProviderValue}>{children}</SWRConfig>;
};
