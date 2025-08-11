import { apiClient } from '../client';
import { isServerEnvironment } from '@/lib/utils/utils';
import { APIError } from '@/types/api';

// 用户基础信息响应
export interface UserInfo {
  user_id: number;
  username: string;
  avatar: string;
  is_admin: number; // AdminLevel
  email_status: number;
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
    return apiClient
      .getWithCookie<UserInfo>(`${this.basePath}`)
      .catch((error) => {
        if (error instanceof APIError && error.statusCode === 401) {
          return null;
        }
        throw error;
      });
  }

  /**
   * 获取OAuth2登录链接
   */
  getOAuthLoginUrl(): string {
    const oauthClient = process.env.NEXT_PUBLIC_APP_BBS_OAUTH_CLIENT || '';

    return (
      'https://bbs.tampermonkey.net.cn/plugin.php?id=codfrm_oauth2:oauth&client_id=' +
      encodeURIComponent(oauthClient) +
      '&scope=user&response_type=code&redirect_uri=' +
      encodeURIComponent((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/v2') +
      '%2Flogin%2Foauth%3Fredirect_uri%3D' +
      encodeURIComponent(
        location.pathname + (location.search ? '?' + location.search : ''),
      )
    );
  }

  /**
   * 登出
   */
  async logout() {
    return apiClient.post<void>(`${this.basePath}/logout`);
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
   * @param uid 用户ID
   */
  async getUserDetail(uid: number) {
    return apiClient.getWithCookie<GetUserDetailResponse>(
      `${this.basePath}/${uid}/detail`,
    );
  }

  /**
   * 关注或取消关注用户
   * @param uid 用户ID
   * @param unfollow 是否取消关注，true为取消关注，false或undefined为关注
   */
  async followUser(uid: number, unfollow: boolean = false) {
    const data: FollowUserRequest = { unfollow };
    return apiClient.post<FollowUserResponse>(
      `${this.basePath}/${uid}/follow`,
      data,
    );
  }
}

// 创建服务实例
export const userService = new UserService();

// 导出兼容的函数形式（用于向后兼容）
export const GetUserList = (query: string) => userService.getUserList(query);
