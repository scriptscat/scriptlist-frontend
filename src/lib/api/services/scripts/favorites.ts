import { apiClient } from '../../client';
import type { ListData, PageRequest } from '@/types/api';
import type { ScriptInfo } from '@/app/[locale]/script-show-page/[id]/types';

// 收藏夹相关类型定义
export interface CreateFolderRequest {
  name: string;
  description?: string;
  private: 1 | 2; // 1私密 2公开
}

export interface UpdateFolderRequest {
  name: string;
  description?: string;
  private: 1 | 2; // 1私密 2公开
}

export interface CreateFolderResponse {
  id: number;
}

export interface FavoriteFolderItem {
  id: number;
  user_id: number;
  name: string;
  description: string;
  count: number; // 收藏夹中脚本数量
  private: number;
}

export interface FavoriteFolderListRequest {
  user_id?: number; // 用户ID，0表示当前登录用户
}

export interface FavoriteScriptRequest {
  script_id: number; // 脚本ID，作为查询参数传递
}

export interface UnfavoriteScriptRequest {
  script_id: number; // 脚本ID，作为查询参数传递
}

export interface FavoriteScriptListRequest extends PageRequest {
  folder_id?: number; // 收藏夹ID，0表示所有的收藏
  user_id?: number; // 用户ID，0表示当前登录用户
}

/**
 * 脚本收藏相关API服务
 * 包含收藏夹管理、脚本收藏/取消收藏等功能
 */
export class ScriptFavoriteService {
  private readonly basePath = '/favorites';
  private readonly scriptBasePath = '/scripts';

  /**
   * 创建收藏夹
   */
  async createFolder(data: CreateFolderRequest): Promise<CreateFolderResponse> {
    return apiClient.post<CreateFolderResponse>(
      `${this.basePath}/folders`,
      data,
    );
  }

  /**
   * 删除收藏夹
   */
  async deleteFolder(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/folders/${id}`);
  }

  /**
   * 更新收藏夹
   */
  async updateFolder(id: number, data: UpdateFolderRequest): Promise<void> {
    return apiClient.put(`${this.basePath}/folders/${id}`, data);
  }

  /**
   * 获取收藏夹列表
   */
  async getFolderList(
    params: FavoriteFolderListRequest = {},
  ): Promise<ListData<FavoriteFolderItem>> {
    return apiClient.getWithCookie<ListData<FavoriteFolderItem>>(
      `${this.basePath}/folders`,
      params,
    );
  }

  /**
   * 获取收藏夹详情
   */
  async getFolderDetail(id: number): Promise<FavoriteFolderItem> {
    return apiClient.getWithCookie<FavoriteFolderItem>(
      `${this.basePath}/folders/${id}/detail`,
    );
  }

  /**
   * 收藏脚本
   */
  async favoriteScript(
    folderId: number,
    data: FavoriteScriptRequest,
  ): Promise<void> {
    return apiClient.post<void>(
      `${this.basePath}/folders/${folderId}/favorite`,
      data,
    );
  }

  /**
   * 取消收藏脚本
   */
  async unfavoriteScript(
    folderId: number, // 如果为0表示在所有收藏夹中取消收藏
    data: UnfavoriteScriptRequest,
  ): Promise<void> {
    return apiClient.delete<void>(
      `${this.basePath}/folders/${folderId}/favorite`,
      { params: data },
    );
  }

  /**
   * 获取收藏夹中的脚本列表
   */
  async getFavoriteScriptList(
    params: FavoriteScriptListRequest = {},
  ): Promise<ListData<ScriptInfo>> {
    const requestParams = {
      page: 1,
      size: 20,
      ...params,
    };

    return apiClient.getWithCookie<ListData<ScriptInfo>>(
      `${this.basePath}/scripts`,
      requestParams,
    );
  }
}

// 导出单例实例
export const scriptFavoriteService = new ScriptFavoriteService();
