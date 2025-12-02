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
 */
export function useNotificationList(params: NotificationListRequest = {}) {
  const key = ['notification-list', params];

  return useSWR<ListData<Notification>, APIError>(
    key,
    async () => {
      return notificationService.getList(params);
    },
    {
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
      refreshInterval: 60 * 1000, // 每分钟刷新一次
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // 缓存时间30秒
      dedupingInterval: 30 * 1000,
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
