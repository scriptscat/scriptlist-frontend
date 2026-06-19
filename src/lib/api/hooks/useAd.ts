import useSWR from 'swr';
import type { AdSlotItem } from '../services/advertise';
import { advertiseService } from '../services/advertise';
import type { APIError } from '@/types/api';

/** 拉取某广告位的单条广告（后端已按 weight 挑好）。 */
export function useAd(slot: string, locale: string) {
  const key = slot && locale ? ['ad', slot, locale] : null;
  return useSWR<{ ad: AdSlotItem | null }, APIError>(
    key,
    () => advertiseService.getAd(slot, locale),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 1000,
    },
  );
}
