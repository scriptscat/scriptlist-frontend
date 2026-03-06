'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { userService } from '../services/user';
import type { Webhook, UserConfig } from '../services/user';
import type { APIError } from '@/types/api';

/**
 * 获取Webhook信息的hook
 */
export function useWebhook() {
  return useSWR<Webhook, APIError>('webhook', () => userService.getWebhook(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    // 缓存时间5分钟
    dedupingInterval: 5 * 60 * 1000,
  });
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
    },
  );
}

/**
 * 修改密码的hook
 */
export function useChangePassword() {
  const [loading, setLoading] = useState(false);

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const data = await userService.changePassword(oldPassword, newPassword);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    changePassword,
    loading,
  };
}

/**
 * 发送注销验证码的hook
 */
export function useSendDeactivateCode() {
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    try {
      const data = await userService.sendDeactivateCode();
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return { sendCode, loading };
}

/**
 * 确认注销的hook
 */
export function useDeactivate() {
  const [loading, setLoading] = useState(false);

  const deactivate = async (code: string) => {
    setLoading(true);
    try {
      const data = await userService.deactivate(code);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return { deactivate, loading };
}

/**
 * 取消注销的hook
 */
export function useCancelDeactivate() {
  const [loading, setLoading] = useState(false);

  const cancelDeactivate = async () => {
    setLoading(true);
    try {
      const data = await userService.cancelDeactivate();
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return { cancelDeactivate, loading };
}

/**
 * 更新用户通知配置的hook
 */
export function useUpdateUserNotify() {
  const [loading, setLoading] = useState(false);

  const updateNotify = async (notify: { [key: string]: number }) => {
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
