import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 导入 dayjs 语言包
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/ja';
import 'dayjs/locale/ru';
import 'dayjs/locale/vi';
import 'dayjs/locale/de';

// 扩展 dayjs 插件
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

// 语言映射
export const dayjsLocaleMapping: Record<string, string> = {
  en: 'en',
  'en-US': 'en',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  'zh-HK': 'zh-tw',
  ja: 'ja',
  'ja-JP': 'ja',
  ru: 'ru',
  'ru-RU': 'ru',
  vi: 'vi',
  'vi-VN': 'vi',
  de: 'de',
  'de-DE': 'de',
  'ach-UG': 'en', // 回退到英语
};

/**
 * 设置 dayjs 的语言环境
 * @param locale 语言代码
 */
export function setDayjsLocale(locale: string): void {
  const dayjsLocale = dayjsLocaleMapping[locale] || dayjsLocaleMapping['en'];
  dayjs.locale(dayjsLocale);
}

export default dayjs;
