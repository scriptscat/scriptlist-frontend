import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
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

// 紧凑数字：1234 → 1.2K，1200000 → 1.2M（用于侧栏窄列统计，避免换行）
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}
