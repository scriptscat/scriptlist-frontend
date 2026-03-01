import { apiClient } from '../client';
import type { ListData } from '@/types/api';

export type AuditLogItem = {
  id: number;
  user_id: number;
  username: string;
  action: string;
  target_type: string;
  target_id: number;
  target_name: string;
  is_admin: boolean;
  reason: string;
  createtime: number;
};

export type AuditLogListParams = {
  page?: number;
  size?: number;
  action?: string;
};

export type AuditLogListResponse = ListData<AuditLogItem>;

class AuditLogService {
  private readonly basePath = '/audit-logs';

  /**
   * 全局管理日志（公开）
   */
  async list(params?: AuditLogListParams) {
    return apiClient.getWithCookie<AuditLogListResponse>(this.basePath, params);
  }

  /**
   * 单脚本管理日志
   */
  async scriptList(scriptId: number, params?: AuditLogListParams) {
    return apiClient.getWithCookie<AuditLogListResponse>(
      `/scripts/${scriptId}/audit-logs`,
      params,
    );
  }
}

export const auditLogService = new AuditLogService();
