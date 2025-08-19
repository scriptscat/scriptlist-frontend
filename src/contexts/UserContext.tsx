'use client';

import React, { createContext, useContext } from 'react';
import { userService } from '@/lib/api';
import type { UserInfo } from '@/lib/api/services/user';

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
  const login = () => {
    const loginUrl = userService.getOAuthLoginUrl();
    window.location.href = loginUrl;
  };

  const logout = async () => {
    try {
      await userService.logout();
      // 刷新页面
      window.location.reload();
    } catch (err: any) {
      console.error('登出失败:', err);
    }
  };

  const value: UserContextType = {
    user,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
