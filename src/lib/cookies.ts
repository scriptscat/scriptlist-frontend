export const THEME_COOKIE_NAME = 'theme';
export const THEME_MODE_COOKIE_NAME = 'theme-mode';

export type ThemeMode = {
  mode: 'light' | 'dark' | 'auto';
  theme: 'light' | 'dark';
};

export function getThemeFromCookie(): ThemeMode {
  const ret: ThemeMode = {
    mode: 'auto',
    theme: 'light',
  };
  if (typeof document === 'undefined') return ret;

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === THEME_COOKIE_NAME) {
      ret.theme = value === 'dark' ? 'dark' : 'light';
    } else if (name === THEME_MODE_COOKIE_NAME) {
      ret.mode = value as 'light' | 'dark' | 'auto';
    }
  }
  return ret;
}

export function setThemeCookie(themeMode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.cookie = `${THEME_COOKIE_NAME}=${themeMode.theme}; path=/; max-age=31536000`;
  document.cookie = `${THEME_MODE_COOKIE_NAME}=${themeMode.mode}; path=/; max-age=31536000`;
}
