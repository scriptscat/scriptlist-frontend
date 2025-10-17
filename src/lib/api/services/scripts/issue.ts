import { apiClient } from '../../client';
import type { ListData } from '@/types/api';

// Issue类型定义
export type IssueStatusType = 1 | 3; // 1: 待解决, 3: 已关闭

export type Issue = {
  id: number;
  user_id: number;
  avatar: string;
  title: string;
  content: string;
  username: string;
  labels: string[];
  status: IssueStatusType; // 0:删除 1: 待解决 3: 已关闭
  createtime: number;
  updatetime: number;
  comment_count: number; // 回复数量，可选字段
};

export type IssueListParams = {
  page?: number;
  size?: number;
  status?: IssueStatusType;
  keyword?: string;
  sort?: string;
};

export type IssueComment = {
  id: number;
  user_id: number;
  avatar: string;
  username: string;
  content: string;
  type: 1 | 2 | 3 | 4 | 5 | 6; // 1:comment 2:change-title 3:change-label 4:open 5:close 6:delete
  createtime: number;
};

export type IssueListResponse = ListData<Issue>;
export type IssueCommentListResponse = ListData<IssueComment>;

// Watch相关类型定义
export type WatchUser = {
  id: number;
  username: string;
  avatar: string;
};

export type WatchListResponse = {
  list: WatchUser[];
  total: number;
};

export type IsWatchIssueResponse = {
  watch: boolean;
};

/**
 * 脚本Issue API服务
 */
export class ScriptIssueService {
  private readonly basePath = '/scripts';

  /**
   * 获取脚本Issue列表
   */
  async getIssueList(
    scriptId: number,
    params?: IssueListParams,
  ): Promise<IssueListResponse> {
    return apiClient.getWithCookie<IssueListResponse>(
      `${this.basePath}/${scriptId}/issues`,
      params,
    );
  }

  /**
   * 获取Issue详情
   */
  async getIssueDetail(scriptId: number, issueId: number): Promise<Issue> {
    return apiClient.getWithCookie<Issue>(
      `${this.basePath}/${scriptId}/issues/${issueId}`,
    );
  }

  /**
   * 创建新Issue
   */
  async createIssue(
    scriptId: number,
    data: {
      title: string;
      content: string;
      labels?: string[];
    },
  ): Promise<Issue> {
    return apiClient.post<Issue>(`${this.basePath}/${scriptId}/issues`, data);
  }

  /**
   * 更新Issue
   */
  async updateIssue(
    scriptId: number,
    issueId: number,
    data: {
      title?: string;
      content?: string;
      labels?: string[];
      status?: IssueStatusType;
    },
  ): Promise<Issue> {
    return apiClient.put<Issue>(
      `${this.basePath}/${scriptId}/issues/${issueId}`,
      data,
    );
  }

  /**
   * 删除Issue
   */
  async deleteIssue(scriptId: number, issueId: number): Promise<void> {
    return apiClient.delete(`${this.basePath}/${scriptId}/issues/${issueId}`);
  }

  /**
   * 关闭/重新打开Issue
   */
  async toggleIssueStatus(
    scriptId: number,
    issueId: number,
    status: IssueStatusType,
  ): Promise<Issue> {
    return apiClient.put<Issue>(
      `${this.basePath}/${scriptId}/issues/${issueId}/status`,
      { status },
    );
  }

  /**
   * 获取Issue评论列表
   */
  async getIssueCommentList(
    scriptId: number,
    issueId: number,
  ): Promise<IssueComment[] | null> {
    try {
      const response = await apiClient.getWithCookie<IssueCommentListResponse>(
        `${this.basePath}/${scriptId}/issues/${issueId}/comment`,
      );
      return response.list;
    } catch (error: any) {
      // 如果是404错误，返回null
      if (error?.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 发表评论
   */
  async postComment(
    scriptId: number,
    issueId: number,
    content: string,
  ): Promise<any> {
    return apiClient.post(
      `${this.basePath}/${scriptId}/issues/${issueId}/comment`,
      { content },
    );
  }

  /**
   * 更新评论
   */
  async updateComment(
    scriptId: number,
    issueId: number,
    commentId: number,
    content: string,
  ): Promise<any> {
    return apiClient.put(
      `${this.basePath}/${scriptId}/issues/${issueId}/comment/${commentId}`,
      { content },
    );
  }

  /**
   * 删除评论
   */
  async deleteComment(
    scriptId: number,
    issueId: number,
    commentId: number,
  ): Promise<any> {
    return apiClient.delete(
      `${this.basePath}/${scriptId}/issues/${issueId}/comment/${commentId}`,
    );
  }

  /**
   * 重新打开Issue
   */
  async openIssue(
    scriptId: number,
    issueId: number,
    options?: {
      close?: boolean;
      content?: string;
    },
  ): Promise<{
    comments: IssueComment[];
  }> {
    return apiClient.put(
      `${this.basePath}/${scriptId}/issues/${issueId}/open`,
      options,
    );
  }

  /**
   * 更新Issue标签
   */
  async updateLabels(
    scriptId: number,
    issueId: number,
    labels: string[],
  ): Promise<any> {
    return apiClient.put(
      `${this.basePath}/${scriptId}/issues/${issueId}/labels`,
      { labels },
    );
  }

  /**
   * 获取关注Issue的用户列表
   */
  async listWatchIssue(
    scriptId: number,
    issueId: number,
  ): Promise<WatchListResponse> {
    return apiClient.getWithCookie<WatchListResponse>(
      `${this.basePath}/${scriptId}/issues/${issueId}/watchs`,
    );
  }

  /**
   * 检查是否关注Issue
   */
  async isWatchIssue(scriptId: number, issueId: number): Promise<boolean> {
    const response = await apiClient.getWithCookie<IsWatchIssueResponse>(
      `${this.basePath}/${scriptId}/issues/${issueId}/watch`,
    );
    return response.watch;
  }

  /**
   * 关注Issue
   */
  async watchIssue(scriptId: number, issueId: number): Promise<any> {
    return apiClient.put(
      `${this.basePath}/${scriptId}/issues/${issueId}/watch`,
      { watch: true },
    );
  }

  /**
   * 取消关注Issue
   */
  async unwatchIssue(scriptId: number, issueId: number): Promise<any> {
    return apiClient.put(
      `${this.basePath}/${scriptId}/issues/${issueId}/watch`,
      { watch: false },
    );
  }
}

// 导出单例实例
export const scriptIssueService = new ScriptIssueService();
