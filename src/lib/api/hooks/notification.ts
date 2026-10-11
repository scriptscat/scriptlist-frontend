import useSWR from 'swr';
import type { APIError, ListData } from '@/types/api';
import {
  type Notification,
  type NotificationListRequest,
  type UnreadCountResponse,
  type BatchMarkReadRequest,
  type BatchMarkReadResponse,
  notificationService,
} from '../services/notification';

/**
 * 获取通知列表的hook
 * @param params 查询参数
 * @param fallbackData SSR 预取的首屏数据。只在 `params` 与服务端取数用的参数一致时
 *   传入，否则会把上一页的数据当成当前页画出来。翻页 / 换筛选后的等待态由全局
 *   `keepPreviousData` 兜住。
 *
 * 注意 key 恒不为 null：标记已读之后要靠 `mutate()` 刷新列表，
 * 用「首屏不发请求」的空 key 方案会让 `mutate()` 变成空操作。
 */
export function useNotificationList(
  params: NotificationListRequest = {},
  fallbackData?: ListData<Notification>,
) {
  const key = ['notification-list', params];

  return useSWR<ListData<Notification>, APIError>(
    key,
    async () => {
      return notificationService.getList(params);
    },
    {
      fallbackData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // 缓存时间30秒
      dedupingInterval: 30 * 1000,
    },
  );
}

/**
 * 获取未读通知数量的hook
 */
export function useUnreadCount() {
  const key = ['notification-unread-count'];

  return useSWR<UnreadCountResponse, APIError>(
    key,
    async () => {
      return notificationService.getUnreadCount();
    },
    {
      // 自动刷新
      refreshInterval: 120 * 1000, // 每2分钟刷新一次
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // 缓存时间60秒
      dedupingInterval: 60 * 1000,
    },
  );
}

/**
 * 获取通知详情的hook
 * @param id 通知ID
 */
export function useNotificationDetail(id: number | undefined) {
  const key = id ? ['notification-detail', id] : null;

  return useSWR<Notification, APIError>(
    key,
    async () => {
      return notificationService.getDetail(id!);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 标记通知为已读
 */
export async function markNotificationRead(id: number) {
  await notificationService.markRead(id);
}

/**
 * 批量标记已读
 */
export async function batchMarkNotificationRead(
  data: BatchMarkReadRequest = {},
): Promise<BatchMarkReadResponse> {
  return notificationService.batchMarkRead(data);
}
