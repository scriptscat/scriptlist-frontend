import { useSyncExternalStore } from 'react';
import { getTranslations } from 'next-intl/server';
import { useLocale, useNow, useTimeZone, useTranslations } from 'next-intl';
import dayjs, { resolveDayjsLocale } from './dayjs-config';

const ONE_YEAR = 365 * 24 * 60 * 60;

export interface SemDateTimeOptions {
  /** 「现在」的秒级时间戳 */
  now: number;
  /** 超过一年时使用的日期格式 */
  timeFormat: string;
  locale?: string;
  /** 不传则用运行环境的本地时区 */
  timeZone?: string;
}

/** 超过一年显示年月日，否则显示相对时间；结果只取决于入参。 */
export function formatSemDateTime(
  time: number,
  { now, timeFormat, locale, timeZone }: SemDateTimeOptions,
): string {
  let date = dayjs.unix(time);
  if (timeZone) {
    date = date.tz(timeZone);
  }
  if (locale) {
    date = date.locale(resolveDayjsLocale(locale));
  }
  if (time < now - ONE_YEAR) {
    return date.format(timeFormat);
  }
  return date.from(dayjs.unix(now));
}

const subscribeNever = () => () => {};

/** 服务端渲染与水合那一遍为 false，水合完成后为 true */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

export async function semDateTime(time: number): Promise<string> {
  const t = await getTranslations('utils');
  // 如果大于一年，显示年月日
  if (time < new Date().getTime() / 1000 - 365 * 24 * 60 * 60) {
    return dayjs(new Date(time * 1000)).format(t('time_format'));
  }
  return dayjs(new Date(time * 1000)).fromNow();
}

export function useSemDateTime() {
  const t = useTranslations('utils');
  const locale = useLocale();
  const serverNow = useNow();
  const serverTimeZone = useTimeZone();
  const hydrated = useHydrated();
  const timeFormat = t('time_format');

  // 时间文本取决于「现在」和时区，这两样服务端与访客浏览器都不同。水合那一遍必须
  // 复现服务端的输出（用服务端下发的 now 与时区），否则 React 报 #418 并丢弃整段
  // 服务端 HTML；水合完成后再换成访客本地的时间。
  return (time: number): string =>
    formatSemDateTime(
      time,
      hydrated
        ? { now: Date.now() / 1000, timeFormat, locale }
        : {
            now: serverNow.getTime() / 1000,
            timeFormat,
            locale,
            timeZone: serverTimeZone,
          },
    );
}

// 将数字按照千分位格式化
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 紧凑数字：1234 → 1.2K，1200000 → 1.2M（用于侧栏窄列统计，避免换行）
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}
