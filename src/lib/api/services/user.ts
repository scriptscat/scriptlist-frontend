import { apiClient } from '../client';
import { isServerEnvironment } from '@/lib/utils/utils';
import { cache } from 'react';

// 用户基础信息响应
export interface UserInfo {
  user_id: number;
  username: string;
  avatar: string;
  is_admin: number; // AdminLevel
  status?: number; // 1=active, 2=banned, 3=deactivating, 4=deactivated
  deactivate_at?: number; // 注销申请时间戳
}

// 徽章项
export interface BadgeItem {
  name: string;
  description: string;
}

// 获取用户详细信息响应
export interface GetUserDetailResponse extends UserInfo {
  // 成就徽章
  badge: BadgeItem[];
  // 个人简介
  description: string;
  // 加入时间
  join_time: number;
  // 最后活跃
  last_active: number;
  // 位置
  location: string;
  // 个人网站
  website: string;
  // 邮箱
  email: string;
  // 是否关注
  is_follow: boolean;
  // 粉丝
  followers: number;
  // 关注
  following: number;
  // 以下字段仅管理员可见
  ban_reason?: string;
  ban_expire_at?: number;
  register_ip?: string;
  register_ip_location?: string;
  register_email?: string;
}

export interface UpdateUserDetailRequest {
  // 个人描述
  description: string;
  // 位置
  location: string;
  // 个人网站
  website: string;
  // 邮箱
  email: string;
}

// 关注用户请求
export interface FollowUserRequest {
  unfollow?: boolean; // 是否取消关注，true为取消关注，false或undefined为关注
}

// 关注用户响应
export type FollowUserResponse = object;

// Webhook 响应
export interface Webhook {
  token: string;
}

export type WebhookResponse = Webhook;

// 用户配置
export interface UserConfig {
  notify: { [key: string]: number };
}

export type UserConfigResponse = UserConfig;

/**
 * 用户API服务
 */
export class UserService {
  private readonly basePath = '/users';

  /**
   * 获取当前登录用户信息
   * 支持服务端和客户端环境
   */
  async getCurrentUser() {
    // 检测是否在服务端环境
    const isServer = isServerEnvironment();
    if (!isServer) {
      // 客户端环境：直接使用客户端API客户端
      return apiClient.get<UserInfo>(`${this.basePath}`);
    }
    // 服务端环境：使用 Next.js cookies
    const { cookies } = await import('next/headers');
    const c = await cookies();
    if (!c.has('token')) {
      return null;
    }
    return apiClient.getWithCookie<UserInfo>(`${this.basePath}`).catch(() => {
      return null;
    });
  }

  /**
   * 登出
   */
  async logout() {
    return apiClient.get<void>(`${this.basePath}/logout`);
  }

  /**
   * 搜索用户列表
   */
  async getUserList(query: string) {
    return apiClient.get<{
      users: Array<{
        user_id: number;
        username: string;
      }>;
    }>(`${this.basePath}/search?query=${query}`);
  }

  /**
   * 更新用户信息
   */
  async updateUserDetail(userData: UpdateUserDetailRequest) {
    return apiClient.put(`${this.basePath}/detail`, userData);
  }

  /**
   * 上传用户头像
   */
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.put<{ url: string }>(`${this.basePath}/avatar`, formData);
  }

  /**
   * 获取用户详细信息
   * @param userId 用户ID
   */
  async getUserDetail(userId: number) {
    return apiClient.getWithCookie<GetUserDetailResponse>(
      `${this.basePath}/${userId}/detail`,
    );
  }

  getUserDetailCache = cache((userId: number) => {
    return this.getUserDetail(userId);
  });

  /**
   * 关注或取消关注用户
   * @param userId 用户ID
   * @param unfollow 是否取消关注，true为取消关注，false或undefined为关注
   */
  async followUser(userId: number, unfollow: boolean = false) {
    const data: FollowUserRequest = { unfollow };
    return apiClient.post<FollowUserResponse>(
      `${this.basePath}/${userId}/follow`,
      data,
    );
  }

  /**
   * 获取 Webhook 信息
   * 支持服务端和客户端环境
   */
  async getWebhook() {
    return apiClient.getWithCookie<Webhook>(`${this.basePath}/webhook`);
  }

  /**
   * 刷新 Webhook Token
   */
  async refreshWebhookToken() {
    return apiClient.put<Webhook>(`${this.basePath}/webhook`);
  }

  /**
   * 修改密码
   */
  async changePassword(oldPassword: string, newPassword: string) {
    return apiClient.put<{ message: string }>(`${this.basePath}/password`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  /**
   * 刷新登录 token（fire-and-forget）
   * 后端会判断是否需要刷新（超过3天才会真正刷新）
   */
  async refreshToken() {
    return apiClient.post<void>(`${this.basePath}/refresh-token`);
  }

  /**
   * 设置用户通知配置
   * @param notify 通知配置对象
   */
  async setUserNotify(notify: { [key: string]: number }) {
    return apiClient.put(`${this.basePath}/config`, { notify });
  }

  /**
   * 获取用户配置
   * 支持服务端和客户端环境
   */
  async getUserConfig() {
    return apiClient.getWithCookie<UserConfig>(`${this.basePath}/config`);
  }

  /**
   * 发送注销验证码
   */
  async sendDeactivateCode() {
    return apiClient.post<{ message: string }>(
      `${this.basePath}/deactivate/code`,
    );
  }

  /**
   * 确认注销账号
   */
  async deactivate(code: string) {
    return apiClient.post<{
      message: string;
      deactivate_at: number;
      effective_at: number;
    }>(`${this.basePath}/deactivate`, { code });
  }

  /**
   * 取消注销
   */
  async cancelDeactivate() {
    return apiClient.delete<{ message: string }>(`${this.basePath}/deactivate`);
  }
}

// 创建服务实例
export const userService = new UserService();

// 导出兼容的函数形式（用于向后兼容）
export const GetUserList = (query: string) => userService.getUserList(query);
