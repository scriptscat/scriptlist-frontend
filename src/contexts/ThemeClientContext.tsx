'use client';

import {
  useContext,
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from 'react';
import type { ThemeConfig } from 'antd';
import { ConfigProvider, theme } from 'antd';
import type { ThemeMode } from '@/lib/cookies';
import { setThemeCookie } from '@/lib/cookies';
import { getToken, getComponents, getCssVarConfig } from '@/lib/antd-theme';
import '@/lib/iconify-preload';

const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

// 通过 useSyncExternalStore 订阅系统主题（prefers-color-scheme）。
// 这是读取「仅客户端可知、且不能引发 hydration 不匹配」的外部值的标准做法：
// 服务端 / 水合首帧使用 getServerSnapshot，水合后读取真实的 matchMedia 值，
// 若不同则由 React 触发一次正常的 re-render 一并修正 antd（内联 token 样式 / cssVar 类名）。
function subscribeSystemTheme(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(PREFERS_DARK_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSystemThemeSnapshot(): 'light' | 'dark' {
  return window.matchMedia(PREFERS_DARK_QUERY).matches ? 'dark' : 'light';
}

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
  const initial = initialMode || { mode: 'auto', theme: 'light' };

  // 用户选择的模式（light / dark / auto），由用户操作变更并持久化到 cookie。
  const [mode, setMode] = useState<ThemeMode['mode']>(initial.mode);

  // 系统主题：服务端 / 水合首帧回退到 SSR 时的主题（initial.theme），保证首帧与
  // 服务端一致、不产生 hydration 不匹配；水合后读取真实的系统主题。
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    () => initial.theme,
  );

  // 实际生效主题：auto 跟随系统，否则等于所选模式。
  const currentTheme: 'light' | 'dark' = mode === 'auto' ? systemTheme : mode;

  const themeMode = useMemo<ThemeMode>(
    () => ({ mode, theme: currentTheme }),
    [mode, currentTheme],
  );

  const antdTheme: ThemeConfig = useMemo(
    () => ({
      cssVar: getCssVarConfig(currentTheme),
      algorithm:
        currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: getToken(currentTheme),
      components: getComponents(currentTheme),
    }),
    [currentTheme],
  );

  useEffect(() => {
    // 同步实际生效主题到 DOM 和 cookie。currentTheme 变化（含 auto 跟随系统
    // 变化）都会走到这里，data-theme 与 antd 主题保持一致，不再出现暗色覆盖不全。
    document.documentElement.setAttribute('data-theme', currentTheme);
    setThemeCookie(themeMode);
  }, [themeMode, currentTheme]);

  const handleSetThemeMode = useCallback((next: ThemeMode) => {
    // 只记录用户选择的模式，实际主题由模式 + 系统主题派生（见 currentTheme）。
    setMode(next.mode);
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
