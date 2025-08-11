'use client';

import { useContext, createContext, useState, useEffect } from 'react';
import type { ThemeConfig } from 'antd';
import { ConfigProvider, theme } from 'antd';
import type { ThemeMode } from '@/lib/cookies';
import { setThemeCookie } from '@/lib/cookies';

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

  const antdTheme: ThemeConfig = {
    algorithm:
      themeMode.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // 主色调 - GitHub风格蓝色
      colorPrimary: themeMode.theme === 'dark' ? '#58a6ff' : '#0d6efd',

      // 背景色 - GitHub风格背景，增强层次感
      colorBgContainer: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
      colorBgElevated: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
      colorBgLayout: themeMode.theme === 'dark' ? '#0d1117' : '#f6f8fa',
      colorBgSpotlight: themeMode.theme === 'dark' ? '#21262d' : '#f0f3f6',

      // 文本色 - GitHub风格文本对比度
      colorText: themeMode.theme === 'dark' ? '#f8f8f2' : '#24292f',
      colorTextSecondary: themeMode.theme === 'dark' ? '#8b949e' : '#57606a',
      colorTextTertiary: themeMode.theme === 'dark' ? '#6e7681' : '#8b949e',
      colorTextDescription: themeMode.theme === 'dark' ? '#6e7681' : '#8b949e',

      // 边框色 - GitHub风格边框
      colorBorder: themeMode.theme === 'dark' ? '#30363d' : '#d0d7de',
      colorBorderSecondary: themeMode.theme === 'dark' ? '#21262d' : '#d8dee4',

      // 分割线
      colorSplit: themeMode.theme === 'dark' ? '#30363d' : '#d0d7de',

      // 成功、警告、错误色 - 保持原有的语义化颜色
      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: themeMode.theme === 'dark' ? '#58a6ff' : '#0d6efd',

      // 链接色
      colorLink: themeMode.theme === 'dark' ? '#58a6ff' : '#0969da',
      colorLinkHover: themeMode.theme === 'dark' ? '#4f95e5' : '#0550ae',

      // 字体 - 使用 Geist 字体
      fontFamily: `"Geist", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
      fontSize: 14,

      // 圆角 - 现代化圆角设计
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,
      borderRadiusXS: 4,

      // 阴影 - 现代化阴影系统
      boxShadow:
        themeMode.theme === 'dark'
          ? '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.3)'
          : '0 1px 2px 0 rgba(17, 24, 39, 0.05), 0 1px 3px 0 rgba(17, 24, 39, 0.1)',
      boxShadowSecondary:
        themeMode.theme === 'dark'
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)'
          : '0 4px 6px -1px rgba(17, 24, 39, 0.1), 0 2px 4px -1px rgba(17, 24, 39, 0.06)',

      // 动画时长
      motionDurationSlow: '0.3s',
      motionDurationMid: '0.2s',
      motionDurationFast: '0.1s',
    },
    components: {
      // 按钮组件 - GitHub风格按钮
      Button: {
        colorPrimary: themeMode.theme === 'dark' ? '#58a6ff' : '#0d6efd',
        colorPrimaryHover: themeMode.theme === 'dark' ? '#4f95e5' : '#0b5ed7',
        colorPrimaryActive: themeMode.theme === 'dark' ? '#4184e4' : '#0a52be',
        primaryShadow:
          themeMode.theme === 'dark'
            ? '0 2px 0 rgba(88, 166, 255, 0.1)'
            : '0 2px 0 rgba(13, 110, 253, 0.1)',
      },

      // 卡片组件 - GitHub风格卡片
      Card: {
        colorBorderSecondary:
          themeMode.theme === 'dark' ? '#30363d' : '#d0d7de',
        colorBgContainer: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
      },

      // 菜单组件 - GitHub风格菜单
      Menu: {
        colorBgContainer: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
        colorItemBgSelected: themeMode.theme === 'dark' ? '#21262d' : '#ebf5ff',
        colorItemBgHover: themeMode.theme === 'dark' ? '#21262d' : '#f6f8fa',
        colorItemTextSelected:
          themeMode.theme === 'dark' ? '#58a6ff' : '#0969da',
      },

      // 输入框组件 - GitHub风格输入框
      Input: {
        colorBgContainer: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
        colorBorder: themeMode.theme === 'dark' ? '#30363d' : '#d0d7de',
        activeBorderColor: themeMode.theme === 'dark' ? '#58a6ff' : '#0d6efd',
        hoverBorderColor: themeMode.theme === 'dark' ? '#58a6ff' : '#0d6efd',
      },

      // 表格组件 - GitHub风格表格
      Table: {
        colorBgContainer: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
        colorBorderSecondary:
          themeMode.theme === 'dark' ? '#30363d' : '#d0d7de',
        colorFillAlter: themeMode.theme === 'dark' ? '#21262d' : '#f6f8fa',
      },

      // 模态框组件 - 现代化模态框
      Modal: {
        colorBgElevated: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
        colorBgMask:
          themeMode.theme === 'dark'
            ? 'rgba(13, 17, 23, 0.6)'
            : 'rgba(0, 0, 0, 0.45)',
      },

      // 提示组件 - 现代化提示
      Tooltip: {
        colorBgSpotlight: themeMode.theme === 'dark' ? '#30363d' : '#1f2937',
        colorText: themeMode.theme === 'dark' ? '#f8f8f2' : '#ffffff',
      },

      // 标签组件 - 现代化标签
      Tag: {
        colorFill: themeMode.theme === 'dark' ? '#21262d' : '#f3f4f6',
        colorText: themeMode.theme === 'dark' ? '#8b949e' : '#4b5563',
        colorBorder: themeMode.theme === 'dark' ? '#30363d' : '#e5e7eb',
      },

      // 分页组件 - 现代化分页
      Pagination: {
        colorPrimary: themeMode.theme === 'dark' ? '#58a6ff' : '#3b82f6',
        colorPrimaryHover: themeMode.theme === 'dark' ? '#4f95e5' : '#2563eb',
        colorBgContainer: themeMode.theme === 'dark' ? '#161b22' : '#ffffff',
      },
    },
  };

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
