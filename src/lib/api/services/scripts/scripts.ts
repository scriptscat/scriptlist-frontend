import { apiClient } from '../../client';
import type { ListData } from '@/types/api';
import type {
  ScriptInfo,
  ScriptListItem,
  ScriptSearchRequest,
  ScriptSyncRequest,
  ScriptSetting,
  Category,
  ScriptState,
} from '@/app/[locale]/script-show-page/[id]/types';

// 评分相关类型定义
export interface MyScoreResponse {
  id: number;
  script_id: number;
  user_id: number;
  score: number;
  message: string;
  createtime: number;
  updatetime: number;
}

// 版本管理相关类型定义
export enum EnablePreRelease {
  EnablePreReleaseScript = 1,
  DisablePreReleaseScript = 2,
}

export interface VersionListRequest {
  page?: number;
  size?: number;
}

export interface ScriptVersion {
  id: number;
  user_id: number;
  username: string;
  avatar?: string;
  meta?: string;
  meta_json?: any;
  script_id: number;
  version: string;
  changelog: string;
  is_pre_release: EnablePreRelease;
  status: number;
  createtime: number;
  code?: string;
  definition?: string;
}

export interface VersionListResponse {
  list: ScriptVersion[];
  total: number;
}

// 版本统计响应类型
export interface VersionStatResponse {
  // 正式版本数量
  release_num: number;
  // 预发布版本数量
  pre_release_num: number;
}

// 版本更新请求类型
export interface VersionUpdateRequest {
  changelog: string;
  is_pre_release: EnablePreRelease;
}

// 获取指定版本代码请求参数类型
export interface VersionCodeRequest {
  id: number;
  version: string;
}

// 获取指定版本代码响应类型
export interface VersionCodeResponse {
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  is_admin: number;
  meta_json: any;
  script_id: number;
  version: string;
  changelog: string;
  is_pre_release: number;
  status: number;
  createtime: number;
  code: string;
}

export interface ScoreListItem {
  id: number;
  script_id: number;
  user_id: number;
  username: string;
  avatar?: string;
  score: number;
  message: string;
  author_message: string; // 作者回复
  author_message_createtime: number;
  createtime: number;
  updatetime: number;
}

export interface ScoreListParam {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 评分状态响应类型
export interface ScoreStateResponse {
  // 每个评分的数量
  score_group: Record<number, number>;
  // 评分人数
  score_user_count: number;
}

import { cache } from 'react';
import type { GrayControlValue } from '@/app/[locale]/script-show-page/[id]/components/GrayControl';

/**
 * 脚本核心功能API服务
 * 包含脚本的基本CRUD操作、搜索、代码管理等核心功能
 */
export class ScriptService {
  private readonly basePath = '/scripts';

  /**
   * 获取分类列表
   */
  getCategoryList() {
    return apiClient.getWithCookie<{ categories: Category[] }>(
      '/scripts/category',
      { type: 1 },
    );
  }

  /**
   * 获取脚本列表
   */
  async search(params: ScriptSearchRequest = {}) {
    // 设置默认值
    const requestParams = {
      page: 1,
      size: 20,
      script_type: 0,
      sort: 'today_download',
      ...params,
    };

    return apiClient.getWithCookie<ListData<ScriptListItem>>(
      this.basePath,
      requestParams,
    );
  }

  /**
   * 根据ID获取脚本详情
   */
  async info(id: string): Promise<ScriptInfo> {
    return apiClient.getWithCookie<ScriptInfo>(`${this.basePath}/${id}`);
  }

  /**
   * 根据ID获取脚本详情（使用React cache缓存）
   * 在同一次请求中，相同的scriptId只会调用一次API
   */
  infoCached = cache(async (id: string): Promise<ScriptInfo> => {
    return apiClient.getWithCookie<ScriptInfo>(`${this.basePath}/${id}`);
  });

  /**
   * 获取脚本代码
   */
  async code(id: string) {
    return apiClient.getWithCookie<ScriptInfo>(`${this.basePath}/${id}/code`);
  }

  /**
   * 创建脚本
   */
  async create(data: {
    content: string; // 脚本详细描述 (required)
    code: string; // 脚本代码 (required)
    name?: string; // 库的名字
    description?: string; // 库的描述
    definition?: string; // 库的定义文件
    version?: string; // 库的版本
    tags?: string[]; // 标签
    category?: number; // 分类ID
    type: number; // 脚本类型：1 用户脚本 2 脚本引用库 3 订阅脚本
    public: number; // 公开类型：1 公开 2 半公开 3 私有
    unwell: number; // 不适内容: 1 不适 2 适用
    changelog?: string; // 更新日志
  }) {
    return apiClient.post<ScriptInfo>(`${this.basePath}`, data);
  }

  /**
   * 更新脚本代码
   */
  async updateCode(
    id: string,
    data: {
      version: string; // 库的版本号 (required)
      tags?: string[]; // 标签
      content: string; // 脚本详细描述 (required)
      code: string; // 脚本代码 (required)
      definition?: string; // 库的定义文件
      changelog?: string; // 更新日志
      is_pre_release?: number; // 是否预发布：0, 1, 2
      category?: number; // 分类ID
    },
  ) {
    return apiClient.put<ScriptInfo>(`${this.basePath}/${id}/code`, data);
  }

  /**
   * 更新脚本同步配置
   */
  async updateSync(id: string, data: ScriptSyncRequest) {
    return apiClient.put(`${this.basePath}/${id}/sync`, data);
  }

  /**
   * 更新库信息
   */
  async updateLibInfo(id: string, data: { name: string; description: string }) {
    return apiClient.put(`${this.basePath}/${id}/lib-info`, data);
  }

  /**
   * 更新脚本公开状态
   */
  async updatePublic(scriptId: number, public_: number) {
    return apiClient.put(`${this.basePath}/${scriptId}/public`, {
      public: public_,
    });
  }

  /**
   * 更新脚本不当内容标记
   */
  async updateUnwell(scriptId: number, unwell: number) {
    return apiClient.put(`${this.basePath}/${scriptId}/unwell`, {
      unwell,
    });
  }

  /**
   * 删除脚本
   */
  async deleteScript(id: number) {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * 归档/取消归档脚本
   */
  async archiveScript(id: number, archive: boolean) {
    return apiClient.put(`${this.basePath}/${id}/archive`, {
      archive,
    });
  }

  /**
   * 更新脚本灰度发布控制
   */
  async updateGrayControls(
    scriptId: number,
    enablePreRelease: number,
    grayControls: GrayControlValue[],
  ) {
    return apiClient.put<any>(`${this.basePath}/${scriptId}/gray`, {
      enable_pre_release: enablePreRelease,
      gray_controls: grayControls,
    });
  }

  /**
   * 获取脚本灰度发布配置
   */
  async getGrayControls(scriptId: number) {
    return apiClient.getWithCookie<{
      enable_pre_release: number;
      gray_controls: GrayControlValue[];
    }>(`${this.basePath}/${scriptId}/gray`);
  }

  /**
   * 获取脚本设置
   */
  async getSetting(id: number): Promise<ScriptSetting> {
    return apiClient.getWithCookie<ScriptSetting>(
      `${this.basePath}/${id}/setting`,
    );
  }

  /**
   * 获取脚本设置（使用React cache缓存）
   * 在同一次请求中，相同的scriptId只会调用一次API
   */
  getSettingCached = cache(async (id: number): Promise<ScriptSetting> => {
    return apiClient.getWithCookie<ScriptSetting>(
      `${this.basePath}/${id}/setting`,
    );
  });

  /**
   * 获取脚本状态（关注状态等）
   */
  async getScriptState(id: number) {
    return apiClient.getWithCookie<{
      watch: number;
    }>(`${this.basePath}/${id}/state`);
  }

  /**
   * 获取脚本状态（使用React cache缓存）
   * 在同一次请求中，相同的scriptId只会调用一次API
   */
  getScriptStateCached = cache(async (id: number) => {
    return apiClient.getWithCookie<ScriptState>(`${this.basePath}/${id}/state`);
  });

  /**
   * 设置脚本关注状态
   */
  async watchScript(id: number, watch: number) {
    return apiClient.post(`${this.basePath}/${id}/watch`, { watch });
  }

  /**
   * 获取我的评分
   */
  async getMyScore(id: number) {
    return apiClient.getWithCookie<MyScoreResponse>(
      `${this.basePath}/${id}/score/self`,
    );
  }

  /**
   * 获取脚本评分状态
   */
  async getScoreState(id: number) {
    return apiClient.getWithCookie<ScoreStateResponse>(
      `${this.basePath}/${id}/score/state`,
    );
  }

  /**
   * 获取评分列表
   */
  async getScoreList(id: number, params?: ScoreListParam) {
    const queryParams = {
      page: 1,
      size: 20,
      ...params,
    };

    return apiClient.getWithCookie<ListData<ScoreListItem>>(
      `${this.basePath}/${id}/score`,
      queryParams,
    );
  }

  /**
   * 提交评分
   */
  async submitScore(id: number, message: string, score: number) {
    return apiClient.put<{ id: number }>(`${this.basePath}/${id}/score`, {
      message,
      score,
    });
  }

  /**
   * 删除评分
   */
  async deleteScore(scriptId: number, scoreId: number) {
    return apiClient.delete(`${this.basePath}/${scriptId}/score/${scoreId}`);
  }

  /**
   * 提交评论回复
   */
  async submitCommentReply(id: number, commentID: number, message: string) {
    return apiClient.put(`${this.basePath}/${id}/commentReply`, {
      commentID,
      message,
    });
  }

  /**
   * 获取脚本版本列表
   */
  async getVersionList(id: number, params?: VersionListRequest) {
    const queryParams = {
      page: 1,
      size: 20,
      ...params,
    };

    return apiClient.getWithCookie<VersionListResponse>(
      `${this.basePath}/${id}/versions`,
      queryParams,
    );
  }

  /**
   * 获取脚本版本列表（使用React cache缓存）
   * 在同一次请求中，相同的参数只会调用一次API
   */
  getVersionListCached = cache(
    async (id: number, params?: VersionListRequest) => {
      const queryParams = {
        page: 1,
        size: 20,
        ...params,
      };

      return apiClient.getWithCookie<VersionListResponse>(
        `${this.basePath}/${id}/versions`,
        queryParams,
      );
    },
  );

  /**
   * 获取脚本版本统计信息
   */
  async getVersionStat(id: number) {
    return apiClient.getWithCookie<VersionStatResponse>(
      `${this.basePath}/${id}/versions/stat`,
    );
  }

  /**
   * 获取脚本版本统计信息（使用React cache缓存）
   * 在同一次请求中，相同的scriptId只会调用一次API
   */
  getVersionStatCached = cache(async (id: number) => {
    return apiClient.getWithCookie<VersionStatResponse>(
      `${this.basePath}/${id}/versions/stat`,
    );
  });

  /**
   * 获取指定版本的代码
   */
  async getVersionCode(id: string, version: string) {
    return apiClient.getWithCookie<ScriptInfo>(
      `${this.basePath}/${id}/versions/${version}/code`,
    );
  }

  /**
   * 获取指定版本的代码（使用React cache缓存）
   * 在同一次请求中，相同的参数只会调用一次API
   */
  getVersionCodeCached = cache(async (id: string, version: string) => {
    return apiClient.getWithCookie<ScriptInfo>(
      `${this.basePath}/${id}/versions/${version}/code`,
    );
  });

  /**
   * 更新版本信息
   */
  async updateVersion(
    scriptId: number,
    versionId: number,
    data: VersionUpdateRequest,
  ) {
    return apiClient.put<{ success: boolean }>(
      `${this.basePath}/${scriptId}/code/${versionId}`,
      data,
    );
  }

  /**
   * 删除版本
   */
  async deleteVersion(scriptId: number, versionId: number) {
    return apiClient.delete<{ success: boolean }>(
      `${this.basePath}/${scriptId}/code/${versionId}`,
    );
  }

  /**
   * 获取最新评分脚本
   */
  async lastScoreScript() {
    return apiClient.getWithCookie<ListData<ScriptListItem>>(
      `${this.basePath}/last-score`,
    );
  }
}

// 导出单例实例
export const scriptService = new ScriptService();
