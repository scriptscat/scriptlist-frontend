import { apiClient } from '../../client';
import type { ListData } from '@/types/api';

export type ReportStatusType = 1 | 3; // 1: 待处理, 3: 已解决

export type Report = {
  id: number;
  user_id: number;
  avatar: string;
  username: string;
  script_id: number;
  reason: string;
  content?: string;
  status: ReportStatusType;
  createtime: number;
  updatetime: number;
  comment_count: number;
};

export type ReportListParams = {
  page?: number;
  size?: number;
  status?: ReportStatusType;
};

export type ReportComment = {
  id: number;
  user_id: number;
  avatar: string;
  username: string;
  report_id: number;
  content: string;
  type: 1 | 2 | 3; // 1:comment 2:resolve 3:reopen
  createtime: number;
};

export type ReportListResponse = ListData<Report>;
export type ReportCommentListResponse = ListData<ReportComment>;

export class ScriptReportService {
  private readonly basePath = '/scripts';

  async getReportList(
    scriptId: number,
    params?: ReportListParams,
  ): Promise<ReportListResponse> {
    return apiClient.getWithCookie<ReportListResponse>(
      `${this.basePath}/${scriptId}/reports`,
      params,
    );
  }

  async getReportDetail(scriptId: number, reportId: number): Promise<Report> {
    return apiClient.getWithCookie<Report>(
      `${this.basePath}/${scriptId}/reports/${reportId}`,
    );
  }

  async createReport(
    scriptId: number,
    data: {
      reason: string;
      content: string;
    },
  ): Promise<{ id: number }> {
    return apiClient.post<{ id: number }>(
      `${this.basePath}/${scriptId}/reports`,
      data,
    );
  }

  async resolveReport(
    scriptId: number,
    reportId: number,
    options?: {
      close?: boolean;
      content?: string;
    },
  ): Promise<{
    comments: ReportComment[];
  }> {
    return apiClient.put(
      `${this.basePath}/${scriptId}/reports/${reportId}/resolve`,
      options,
    );
  }

  async deleteReport(scriptId: number, reportId: number): Promise<void> {
    return apiClient.delete(`${this.basePath}/${scriptId}/reports/${reportId}`);
  }

  async getCommentList(
    scriptId: number,
    reportId: number,
  ): Promise<ReportComment[] | null> {
    try {
      const response = await apiClient.getWithCookie<ReportCommentListResponse>(
        `${this.basePath}/${scriptId}/reports/${reportId}/comments`,
      );
      return response.list;
    } catch (error: any) {
      if (error?.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async postComment(
    scriptId: number,
    reportId: number,
    content: string,
  ): Promise<ReportComment> {
    return apiClient.post<ReportComment>(
      `${this.basePath}/${scriptId}/reports/${reportId}/comments`,
      { content },
    );
  }

  async deleteComment(
    scriptId: number,
    reportId: number,
    commentId: number,
  ): Promise<any> {
    return apiClient.delete(
      `${this.basePath}/${scriptId}/reports/${reportId}/comments/${commentId}`,
    );
  }
}

export const scriptReportService = new ScriptReportService();
