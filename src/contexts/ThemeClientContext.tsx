'use client';

import {
  useContext,
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type { ThemeConfig } from 'antd';
import { ConfigProvider, theme } from 'antd';
import type { ThemeMode } from '@/lib/cookies';
import { setThemeCookie } from '@/lib/cookies';
import { getToken, getComponents, getCssVarConfig } from '@/lib/antd-theme';
import '@/lib/iconify-preload';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeClientProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeClientProvider: React.FC<ThemeClientProviderProps> = ({
  children,
  initialMode,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const initial = initialMode || { mode: 'auto', theme: 'light' };
    if (initial.mode === 'auto' && typeof window !== 'undefined') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      return { mode: 'auto', theme: prefersDark ? 'dark' : 'light' };
    }
    return initial;
  });

  const antdTheme: ThemeConfig = useMemo(
    () => ({
      cssVar: getCssVarConfig(themeMode.theme),
      algorithm:
        themeMode.theme === 'dark'
          ? theme.darkAlgorithm
          : theme.defaultAlgorithm,
      token: getToken(themeMode.theme),
      components: getComponents(themeMode.theme),
    }),
    [themeMode.theme],
  );

  useEffect(() => {
    // 同步主题到 DOM 和 cookie
    document.documentElement.setAttribute('data-theme', themeMode.theme);
    setThemeCookie(themeMode);

    // auto 模式下监听系统主题变化
    if (themeMode.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newThemeMode: ThemeMode = {
          mode: 'auto',
          theme: e.matches ? 'dark' : 'light',
        };
        setThemeMode(newThemeMode);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  const handleSetThemeMode = useCallback((mode: ThemeMode) => {
    // 设置主题到cookie
    setThemeMode(mode);
  }, []);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      themeMode,
      setThemeMode: handleSetThemeMode,
    }),
    [themeMode, handleSetThemeMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};
