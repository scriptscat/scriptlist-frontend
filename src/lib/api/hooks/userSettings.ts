import useSWR from 'swr';
import { useState } from 'react';
import { userService } from '../services/user';
import type { Webhook, UserConfig } from '../services/user';
import type { APIError } from '@/types/api';

/**
 * 获取Webhook信息的hook
 */
export function useWebhook() {
  return useSWR<Webhook, APIError>(
    'webhook',
    () => userService.getWebhook(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // 缓存时间5分钟
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

/**
 * 刷新Webhook Token的hook
 */
export function useRefreshWebhookToken() {
  const [loading, setLoading] = useState(false);
  
  const refreshToken = async () => {
    setLoading(true);
    try {
      const data = await userService.refreshWebhookToken();
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    refreshToken,
    loading,
  };
}

/**
 * 获取用户配置的hook
 */
export function useUserConfig() {
  return useSWR<UserConfig, APIError>(
    'user-config',
    () => userService.getUserConfig(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // 缓存时间5分钟
      dedupingInterval: 5 * 60 * 1000,
    }
  );
}

/**
 * 更新用户通知配置的hook
 */
export function useUpdateUserNotify() {
  const [loading, setLoading] = useState(false);
  
  const updateNotify = async (notify: { [key: string]: boolean }) => {
    setLoading(true);
    try {
      await userService.setUserNotify(notify);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    updateNotify,
    loading,
  };
}
