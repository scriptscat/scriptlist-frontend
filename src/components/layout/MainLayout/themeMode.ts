import type { ThemeMode } from '@/lib/cookies';

// auto（跟随系统）需读取当前系统主题，而不是固定为 light，
// 否则在深色系统上切到「跟随系统」会错误地显示为浅色。
export function resolveThemeMode(mode: ThemeMode['mode']): ThemeMode {
  const theme: ThemeMode['theme'] =
    mode === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode;
  return { mode, theme };
}
