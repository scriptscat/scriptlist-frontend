import useSWR from 'swr';
import type { Announcement } from '../services/announcement';
import { announcementService } from '../services/announcement';
import type { APIError, ListData } from '@/types/api';

/**
 * 获取公告列表
 */
export function useAnnouncementList(params: {
  page?: number;
  size?: number;
  locale: string;
}) {
  const key = params.locale
    ? ['announcement-list', params.page, params.size, params.locale]
    : null;

  return useSWR<ListData<Announcement>, APIError>(
    key,
    () => announcementService.getList(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );
}

/**
 * 获取最新重要公告（用于顶部横幅）
 */
export function useLatestAnnouncement(locale: string) {
  const key = locale ? ['announcement-latest', locale] : null;

  return useSWR<Announcement | null, APIError>(
    key,
    () => announcementService.getLatest(locale),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );
}
