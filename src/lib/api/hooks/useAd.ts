import useSWR from 'swr';
import type { AdSlotItem } from '../services/advertise';
import { advertiseService } from '../services/advertise';
import type { APIError } from '@/types/api';

/**
 * 拉取某广告位的单条广告（后端已按 weight 挑好）。
 * 传入 initialData（服务端预取结果）时作为 SWR fallbackData 注入，使广告进入
 * SSR 首屏 HTML；此时不在挂载后重新拉取，避免把服务端选定的广告换成另一条。
 */
export function useAd(
  slot: string,
  locale: string,
  initialData?: { ad: AdSlotItem | null },
) {
  const key = slot && locale ? ['ad', slot, locale] : null;
  return useSWR<{ ad: AdSlotItem | null }, APIError>(
    key,
    () => advertiseService.getAd(slot, locale),
    {
      fallbackData: initialData,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 1000,
    },
  );
}
