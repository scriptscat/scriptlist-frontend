import { apiClient } from '../client';
import type { ListData, PageRequest } from '@/types/api';

// 通知类型枚举
export enum NotificationType {
  SYSTEM = 1, // 系统通知
  SCRIPT = 2, // 脚本相关
  COMMENT = 3, // 评论
  FOLLOW = 4, // 关注
  INVITE = 5, // 邀请
}

// 通知读取状态
export enum NotificationReadStatus {
  UNREAD = 0, // 未读
  READ = 1, // 已读
}

// 用户信息
export interface UserInfo {
  user_id: number;
  username: string;
  avatar: string;
  is_admin: number;
  email_status: number;
}

// 通知信息
export interface Notification {
  id: number;
  user_id: number;
  from_user_id?: number; // 发起用户ID
  from_user?: UserInfo; // 发起用户信息
  type: NotificationType; // 通知类型
  title: string; // 通知标题
  content: string; // 通知内容
  link?: string; // 关联链接
  read_status: NotificationReadStatus; // 0:未读 1:已读
  read_time?: number; // 阅读时间
  createtime: number;
  updatetime: number;
}

// 获取通知列表请求参数
export interface NotificationListRequest extends PageRequest {
  read_status?: 1 | 2; // 1:未读 2:已读 不传则全部
  type?: NotificationType; // 通知类型筛选
}

// 未读数统计项
export interface UnreadCountItem {
  type: NotificationType; // 通知类型
  count: number; // 未读数量
}

// 未读数统计响应
export interface UnreadCountResponse {
  total: number; // 总未读数
  items: UnreadCountItem[]; // 分类统计
}

// 批量标记已读请求
export interface BatchMarkReadRequest {
  ids?: number[]; // 通知ID列表，为空则全部标记已读
  type?: NotificationType; // 按类型标记，配合IDs为空使用
}

// 批量标记已读响应
export interface BatchMarkReadResponse {
  count: number; // 标记数量
}

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
  async markRead(id: number) {
    return apiClient.put<void>(`${this.basePath}/${id}/read`);
  }

  /**
   * 批量标记已读
   * @param data 批量标记请求参数
   */
  async batchMarkRead(data: BatchMarkReadRequest = {}) {
    return apiClient.put<BatchMarkReadResponse>(
      `${this.basePath}/read`,
      data,
    );
  }
}

// 创建服务实例
export const notificationService = new NotificationService();

// 判断是否使用Mock数据
const USE_MOCK = process.env.NEXT_PUBLIC_USE_NOTIFICATION_MOCK === 'true';

// 导出实际使用的服务（可在环境变量中切换）
export const getNotificationService = () => {
  if (USE_MOCK) {
    // 动态导入mock服务
    return import('./notification.mock').then((m) => m.mockNotificationService);
  }
  return Promise.resolve(notificationService);
};
