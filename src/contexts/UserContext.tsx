'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { userService } from '@/lib/api';
import type { UserInfo } from '@/lib/api/services/user';
import { useRouter } from '@/i18n/routing';

interface UserContextType {
  user: UserInfo | null;
  login: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserInfo | null;
}) {
  const login = useCallback(() => {
    const loginUrl = userService.getOAuthLoginUrl();
    window.location.href = loginUrl;
  }, []);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
      // 刷新页面
      window.location.reload();
    } catch (err: any) {
      console.error('登出失败:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    // 距上次刷新不足 3 天则跳过，避免每次加载都请求
    const REFRESH_INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 天
    const STORAGE_KEY = 'token_last_refresh';
    const last = Number(localStorage.getItem(STORAGE_KEY) || '0');
    if (Date.now() - last < REFRESH_INTERVAL) return;

    userService
      .refreshToken()
      .then(() => {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      })
      .catch(() => {
        // 刷新失败静默忽略，不影响用户体验
      });
  }, []);

  const value = useMemo<UserContextType>(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
