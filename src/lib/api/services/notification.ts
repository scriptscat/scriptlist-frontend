import { apiClient } from '../client';
import type { ListData, PageRequest } from '@/types/api';
import type { UserInfo } from './user';

// 通知读取状态
export enum NotificationReadStatus {
  UNREAD = 1, // 未读
  READ = 2, // 已读
}

// 通知信息
export interface Notification {
  id: number;
  user_id: number;
  from_user?: UserInfo; // 发起用户信息
  type: number; // 通知类型
  title?: string; // 通知标题
  content: string; // 通知内容
  link?: string; // 通知链接
  params: Record<string, any>; // 额外参数
  read_status: NotificationReadStatus; // 1:未读 2:已读
  read_time?: number; // 阅读时间
  createtime: number;
  updatetime: number;
}

// 获取通知列表请求参数
export type NotificationListRequest = PageRequest & {
  read_status?: number; // 0:全部 1:未读 2:已读
};

// 未读数统计响应
export interface UnreadCountResponse {
  total: number; // 总未读数
}

// 批量标记已读请求
export interface BatchMarkReadRequest {
  ids?: number[]; // 通知ID列表，为空则全部标记已读
}

// 批量标记已读响应
export type BatchMarkReadResponse = object;

/**
 * 通知API服务
 */
export class NotificationService {
  private readonly basePath = '/notifications';

  /**
   * 获取通知列表
   * @param params 查询参数
   */
  async getList(params: NotificationListRequest = {}) {
    const requestParams = { page: 1, size: 20, ...params };
    return apiClient.getWithCookie<ListData<Notification>>(
      this.basePath,
      requestParams,
    );
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount() {
    return apiClient.getWithCookie<UnreadCountResponse>(
      `${this.basePath}/unread-count`,
    );
  }

  /**
   * 获取通知详情
   * @param id 通知ID
   */
  async getDetail(id: number) {
    return apiClient.getWithCookie<Notification>(`${this.basePath}/${id}`);
  }

  /**
   * 标记通知为已读
   * @param id 通知ID
   */
  async markRead(id: number, unread?: number) {
    return apiClient.put<void>(`${this.basePath}/${id}/read`, { unread });
  }

  /**
   * 批量标记已读
   * @param data 批量标记请求参数
   */
  async batchMarkRead(data: BatchMarkReadRequest = {}) {
    return apiClient.put<BatchMarkReadResponse>(`${this.basePath}/read`, data);
  }
}

// 创建服务实例
export const notificationService = new NotificationService();
