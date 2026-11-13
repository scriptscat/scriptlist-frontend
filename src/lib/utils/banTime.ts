import { useSyncExternalStore } from 'react';
import { useLocale, useNow, useTimeZone, useTranslations } from 'next-intl';
import dayjs from './dayjs-config';

/** 解除时间的展示形态：今天/明天只给时分，其余给本地化日期 */
export type BanUntilParts =
  { kind: 'today' | 'tomorrow'; time: string } | { kind: 'date'; text: string };

/** 剩余时长：≥1 天按天、≥1 小时按小时（均向下取整），否则不足 1 小时 */
export type BanRemaining =
  { unit: 'day' | 'hour'; count: number } | { unit: 'lt_hour' };

export interface BanTimeOptions {
  /** 「现在」的秒级时间戳 */
  now: number;
  locale: string;
  /** 不传则用运行环境的本地时区 */
  timeZone?: string;
}

const inZone = (time: number, timeZone?: string) =>
  timeZone ? dayjs.unix(time).tz(timeZone) : dayjs.unix(time);

/** 结果只取决于入参 */
export function getBanUntilParts(
  expireAt: number,
  { now, locale, timeZone }: BanTimeOptions,
): BanUntilParts {
  const until = inZone(expireAt, timeZone);
  const today = inZone(now, timeZone);
  const date = new Date(expireAt * 1000);
  const hm = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const;

  if (until.isSame(today, 'day')) {
    return {
      kind: 'today',
      time: new Intl.DateTimeFormat(locale, { ...hm, timeZone }).format(date),
    };
  }
  if (until.isSame(today.add(1, 'day'), 'day')) {
    return {
      kind: 'tomorrow',
      time: new Intl.DateTimeFormat(locale, { ...hm, timeZone }).format(date),
    };
  }
  if (until.year() === today.year()) {
    return {
      kind: 'date',
      text: new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        ...hm,
        timeZone,
      }).format(date),
    };
  }
  return {
    kind: 'date',
    text: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone,
    }).format(date),
  };
}

export function getBanRemaining(expireAt: number, now: number): BanRemaining {
  const seconds = expireAt - now;
  if (seconds >= 86400) {
    return { unit: 'day', count: Math.floor(seconds / 86400) };
  }
  if (seconds >= 3600) {
    return { unit: 'hour', count: Math.floor(seconds / 3600) };
  }
  return { unit: 'lt_hour' };
}

/** 完整日期时间，用于悬停浮层 */
export function formatBanFullTime(expireAt: number, timeZone?: string): string {
  return inZone(expireAt, timeZone).format('YYYY-MM-DD HH:mm');
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

/**
 * 封禁时间的展示文案。与 useSemDateTime 同样的处理：水合那一遍用服务端下发的
 * now 与时区，复现服务端输出，避免 React #418；水合后换成访客本地时间。
 */
export function useBanTime() {
  const t = useTranslations('components.ban');
  const locale = useLocale();
  const serverNow = useNow();
  const serverTimeZone = useTimeZone();
  const hydrated = useHydrated();

  const opts = (): BanTimeOptions =>
    hydrated
      ? { now: Date.now() / 1000, locale }
      : { now: serverNow.getTime() / 1000, locale, timeZone: serverTimeZone };

  const until = (expireAt: number): string => {
    const parts = getBanUntilParts(expireAt, opts());
    if (parts.kind === 'date') return parts.text;
    return parts.kind === 'today'
      ? t('today', { time: parts.time })
      : t('tomorrow', { time: parts.time });
  };

  const remaining = (expireAt: number): string => {
    const r = getBanRemaining(expireAt, opts().now);
    if (r.unit === 'day') return t('remaining_days', { count: r.count });
    if (r.unit === 'hour') return t('remaining_hours', { count: r.count });
    return t('remaining_lt_hour');
  };

  const full = (expireAt: number): string =>
    formatBanFullTime(expireAt, opts().timeZone);

  return { until, remaining, full };
}
