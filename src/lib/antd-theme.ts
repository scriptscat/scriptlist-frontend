import type { ThemeConfig } from 'antd';

type ThemeType = 'light' | 'dark';

/** Fixed cssVar keys — must match between prebuild and runtime */
export const CSS_VAR_KEY_LIGHT = 'light';
export const CSS_VAR_KEY_DARK = 'dark';

export function getCssVarConfig(themeType: ThemeType): ThemeConfig['cssVar'] {
  return { key: themeType === 'dark' ? CSS_VAR_KEY_DARK : CSS_VAR_KEY_LIGHT };
}

/** Light-mode custom tokens */
export const lightToken: ThemeConfig['token'] = {
  // 主色调 - GitHub风格蓝色
  colorPrimary: '#0d6efd',

  // 背景色 - GitHub风格背景，增强层次感
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBgLayout: '#f6f8fa',
  colorBgSpotlight: '#f0f3f6',

  // 文本色 - GitHub风格文本对比度
  colorText: '#24292f',
  colorTextSecondary: '#57606a',
  colorTextTertiary: '#8b949e',
  colorTextDescription: '#8b949e',

  // 边框色 - GitHub风格边框
  colorBorder: '#d0d7de',
  colorBorderSecondary: '#d8dee4',

  // 分割线
  colorSplit: '#d0d7de',

  // 成功、警告、错误色
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  colorError: '#ef4444',
  colorInfo: '#0d6efd',

  // 链接色
  colorLink: '#0969da',
  colorLinkHover: '#0550ae',

  // 字体
  fontFamily: `"Geist", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
  fontSize: 14,

  // 圆角
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  borderRadiusXS: 4,

  // 阴影
  boxShadow:
    '0 1px 2px 0 rgba(17, 24, 39, 0.05), 0 1px 3px 0 rgba(17, 24, 39, 0.1)',
  boxShadowSecondary:
    '0 4px 6px -1px rgba(17, 24, 39, 0.1), 0 2px 4px -1px rgba(17, 24, 39, 0.06)',

  // 动画时长
  motionDurationSlow: '0.3s',
  motionDurationMid: '0.2s',
  motionDurationFast: '0.1s',
};

/** Dark-mode custom tokens */
export const darkToken: ThemeConfig['token'] = {
  colorPrimary: '#58a6ff',

  colorBgContainer: '#161b22',
  colorBgElevated: '#161b22',
  colorBgLayout: '#0d1117',
  colorBgSpotlight: '#21262d',

  colorText: '#f8f8f2',
  colorTextSecondary: '#8b949e',
  colorTextTertiary: '#6e7681',
  colorTextDescription: '#6e7681',

  colorBorder: '#30363d',
  colorBorderSecondary: '#21262d',

  colorSplit: '#30363d',

  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  colorError: '#ef4444',
  colorInfo: '#58a6ff',

  colorLink: '#58a6ff',
  colorLinkHover: '#4f95e5',

  fontFamily: `"Geist", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
  fontSize: 14,

  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  borderRadiusXS: 4,

  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.3)',
  boxShadowSecondary:
    '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',

  motionDurationSlow: '0.3s',
  motionDurationMid: '0.2s',
  motionDurationFast: '0.1s',
};

/** Helper to get token by theme */
export function getToken(themeType: ThemeType): ThemeConfig['token'] {
  return themeType === 'dark' ? darkToken : lightToken;
}

/** Light-mode component overrides */
const lightComponents: ThemeConfig['components'] = {
  Button: {
    colorPrimary: '#0d6efd',
    colorPrimaryHover: '#0b5ed7',
    colorPrimaryActive: '#0a52be',
    primaryShadow: '0 2px 0 rgba(13, 110, 253, 0.1)',
  },
  Card: {
    colorBorderSecondary: '#d0d7de',
    colorBgContainer: '#ffffff',
  },
  Menu: {
    colorBgContainer: '#ffffff',
    colorItemBgSelected: '#ebf5ff',
    colorItemBgHover: '#f6f8fa',
    colorItemTextSelected: '#0969da',
  },
  Input: {
    colorBgContainer: '#ffffff',
    colorBorder: '#d0d7de',
    activeBorderColor: '#0d6efd',
    hoverBorderColor: '#0d6efd',
  },
  Table: {
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#d0d7de',
    colorFillAlter: '#f6f8fa',
  },
  Modal: {
    colorBgElevated: '#ffffff',
    colorBgMask: 'rgba(0, 0, 0, 0.45)',
  },
  Tooltip: {
    colorBgSpotlight: '#1f2937',
    colorText: '#ffffff',
  },
  Tag: {
    colorFill: '#f3f4f6',
    colorText: '#4b5563',
    colorBorder: '#e5e7eb',
  },
  Pagination: {
    colorPrimary: '#3b82f6',
    colorPrimaryHover: '#2563eb',
    colorBgContainer: '#ffffff',
  },
};

/** Dark-mode component overrides */
const darkComponents: ThemeConfig['components'] = {
  Button: {
    colorPrimary: '#58a6ff',
    colorPrimaryHover: '#4f95e5',
    colorPrimaryActive: '#4184e4',
    primaryShadow: '0 2px 0 rgba(88, 166, 255, 0.1)',
  },
  Card: {
    colorBorderSecondary: '#30363d',
    colorBgContainer: '#161b22',
  },
  Menu: {
    colorBgContainer: '#161b22',
    colorItemBgSelected: '#21262d',
    colorItemBgHover: '#21262d',
    colorItemTextSelected: '#58a6ff',
  },
  Input: {
    colorBgContainer: '#161b22',
    colorBorder: '#30363d',
    activeBorderColor: '#58a6ff',
    hoverBorderColor: '#58a6ff',
  },
  Table: {
    colorBgContainer: '#161b22',
    colorBorderSecondary: '#30363d',
    colorFillAlter: '#21262d',
  },
  Modal: {
    colorBgElevated: '#161b22',
    colorBgMask: 'rgba(13, 17, 23, 0.6)',
  },
  Tooltip: {
    colorBgSpotlight: '#30363d',
    colorText: '#f8f8f2',
  },
  Tag: {
    colorFill: '#21262d',
    colorText: '#8b949e',
    colorBorder: '#30363d',
  },
  Pagination: {
    colorPrimary: '#58a6ff',
    colorPrimaryHover: '#4f95e5',
    colorBgContainer: '#161b22',
  },
};

/** Helper to get component overrides by theme */
export function getComponents(themeType: ThemeType): ThemeConfig['components'] {
  return themeType === 'dark' ? darkComponents : lightComponents;
}
