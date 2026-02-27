'use client';

import { useContext, createContext, useState, useEffect, useMemo } from 'react';
import type { ThemeConfig } from 'antd';
import { ConfigProvider, theme } from 'antd';
import type { ThemeMode } from '@/lib/cookies';
import { setThemeCookie } from '@/lib/cookies';
import { getToken, getComponents, getCssVarConfig } from '@/lib/antd-theme';

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
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    initialMode || { mode: 'auto', theme: 'light' },
  );

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
    // 记录到cookie
    const saveThemeMode = (mode: ThemeMode) => {
      // 更新 html 元素的 class 以应用 Tailwind 的暗色模式
      const html = document.documentElement;
      html.setAttribute('data-theme', mode.theme);
      setThemeCookie(mode);
    };

    if (themeMode.mode === 'auto') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      const newThemeMode: ThemeMode = {
        mode: 'auto',
        theme: prefersDark ? 'dark' : 'light',
      };
      setThemeMode(newThemeMode);
      saveThemeMode(newThemeMode);
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (themeMode.mode === 'auto') {
          const newThemeMode: ThemeMode = {
            mode: 'auto',
            theme: e.matches ? 'dark' : 'light',
          };
          setThemeMode(newThemeMode);
          saveThemeMode(newThemeMode);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 更新 html 元素的 class 以应用 Tailwind 的暗色模式
      const html = document.documentElement;
      html.setAttribute('data-theme', themeMode.theme);
      setThemeCookie(themeMode);
    }
  }, [themeMode.mode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode: themeMode,
        setThemeMode: (mode: ThemeMode) => {
          // 设置主题到cookie
          setThemeMode(mode);
        },
      }}
    >
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};
