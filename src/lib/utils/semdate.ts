import { getTranslations, getLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import dayjs from './dayjs-config';

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

  return (time: number): string => {
    // 如果大于一年，显示年月日
    if (time < new Date().getTime() / 1000 - 365 * 24 * 60 * 60) {
      return dayjs(new Date(time * 1000)).format(t('time_format'));
    }
    return dayjs(new Date(time * 1000)).fromNow();
  };
}

// 将数字按照千分位格式化
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
