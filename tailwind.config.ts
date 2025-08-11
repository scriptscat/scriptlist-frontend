import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主品牌色 - GitHub风格蓝色系
        primary: {
          50: '#ebf5ff', // GitHub极浅蓝
          100: '#dbeafe', // GitHub很浅蓝
          200: '#bfdbfe', // GitHub浅蓝
          300: '#93c5fd', // GitHub中浅蓝
          400: '#60a5fa', // GitHub中蓝
          500: '#0d6efd', // GitHub标准蓝（主色）
          600: '#0b5ed7', // GitHub深蓝
          700: '#0a52be', // GitHub很深蓝
          800: '#0941a5', // GitHub更深蓝
          900: '#08318c', // GitHub最深蓝
          950: '#061f73', // GitHub极深蓝
        },

        // 中性色 - GitHub风格灰色系
        neutral: {
          50: '#f6f8fa', // GitHub极浅灰（页面背景）
          100: '#f0f3f6', // GitHub很浅灰（二级背景）
          200: '#e9eef4', // GitHub浅灰（三级背景）
          300: '#d0d7de', // GitHub中浅灰（边框）
          400: '#8b949e', // GitHub中灰（次要文本）
          500: '#6e7681', // GitHub标准灰
          600: '#57606a', // GitHub深灰（次要文本）
          700: '#424a53', // GitHub很深灰
          800: '#32383f', // GitHub更深灰
          900: '#24292f', // GitHub最深灰（主文本）
          950: '#1c2128', // GitHub极深灰
        },

        // 语义化颜色
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },

        // 背景色系统 - GitHub风格配色
        background: {
          // 浅色模式背景
          light: {
            primary: '#f6f8fa', // 主背景 - GitHub浅灰
            secondary: '#f0f3f6', // 次级背景 - 更深浅灰
            tertiary: '#e9eef4', // 三级背景 - 明显区分
            elevated: '#ffffff', // 浮起元素背景 - 纯白突出
            overlay: 'rgba(36, 41, 47, 0.1)', // 遮罩
          },
          // 深色模式背景
          dark: {
            primary: '#0d1117', // 主背景 - GitHub风格深色
            secondary: '#161b22', // 次级背景 - GitHub次要深色
            tertiary: '#21262d', // 三级背景 - GitHub三级深色
            elevated: '#161b22', // 浮起元素背景
            overlay: 'rgba(248, 248, 242, 0.1)', // 遮罩
          },
        },

        // 文本色系统 - GitHub风格文本色
        text: {
          light: {
            primary: '#24292f', // 主文本 - GitHub主文本色
            secondary: '#57606a', // 次级文本 - GitHub次要文本
            tertiary: '#8b949e', // 三级文本 - GitHub三级文本
            inverse: '#ffffff', // 反色文本 - 白色
          },
          dark: {
            primary: '#f8f8f2', // 主文本 - 略带暖色的白
            secondary: '#8b949e', // 次级文本 - GitHub风格中灰
            tertiary: '#6e7681', // 三级文本 - GitHub风格浅灰
            inverse: '#0d1117', // 反色文本 - 深色
          },
        },

        // 边框色系统 - GitHub风格边框
        border: {
          light: {
            primary: '#d0d7de', // 主边框 - GitHub标准边框
            secondary: '#d8dee4', // 次级边框 - GitHub轻微边框
            focus: '#0d6efd', // 焦点边框 - GitHub蓝色
          },
          dark: {
            primary: '#30363d', // 主边框 - GitHub风格
            secondary: '#21262d', // 次级边框
            focus: '#58a6ff', // 焦点边框 - 深色模式蓝
          },
        },
      },

      // 背景渐变 - GitHub风格渐变
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #f6f8fa 0%, #f0f3f6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0d6efd 0%, #0a52be 100%)',
      },

      // 盒子阴影 - 现代化阴影系统
      boxShadow: {
        'light-sm': '0 1px 2px 0 rgba(17, 24, 39, 0.05)',
        'light-md':
          '0 4px 6px -1px rgba(17, 24, 39, 0.1), 0 2px 4px -1px rgba(17, 24, 39, 0.06)',
        'light-lg':
          '0 10px 15px -3px rgba(17, 24, 39, 0.1), 0 4px 6px -2px rgba(17, 24, 39, 0.05)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'dark-md':
          '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
        'dark-lg':
          '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
