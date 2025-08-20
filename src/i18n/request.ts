import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';

// 检查语言是否支持
function isSupportedLocale(locale: string): boolean {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This can either be defined statically at the top-level or within
  // the function (e.g. to support per-user locales)
  let locale = (await requestLocale) as (typeof routing.locales)[number];

  // Ensure that a valid locale is used
  if (!locale || !isSupportedLocale(locale)) {
    locale = routing.defaultLocale;
  }

  // 确保 locale 不为空
  const finalLocale = locale || routing.defaultLocale;

  return {
    locale: finalLocale,
    messages: (
      await import(
        `../../public/locales/${localeMapping[finalLocale]}/translations.json`
      )
    ).default,
  };
});

// 映射到语言文件
export const localeMapping: Record<(typeof routing.locales)[number], string> = {
  'zh-CN': 'zh-CN',
  en: 'en-US',
  'zh-TW': 'zh-TW',
  'ach-UG': 'ach-UG',
};
