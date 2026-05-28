import type { ListData } from '@/types/api';
import { apiClient } from '../client';

// ==================== OAuth Apps ====================

export interface OAuthAppItem {
  id: number;
  client_id: string;
  name: string;
  description: string;
  redirect_uri: string;
  status: number;
  createtime: number;
  updatetime: number;
}

export interface CreateOAuthAppRequest {
  name: string;
  description: string;
  redirect_uri: string;
}

export interface CreateOAuthAppResponse {
  id: number;
  client_id: string;
  client_secret: string;
}

export interface UpdateOAuthAppRequest {
  name: string;
  description: string;
  redirect_uri: string;
  status: number;
}

// ==================== System Config ====================

export interface SystemConfigItem {
  key: string;
  value: string;
}

export interface GetSystemConfigsResponse {
  configs: SystemConfigItem[];
}

// ==================== User Management ====================

export interface UserItem {
  id: number;
  username: string;
  email: string;
  register_ip: string;
  ip_location: string;
  avatar: string;
  status: number;
  admin_level: number;
  createtime: number;
}

// ==================== Script Management ====================

export interface ScriptItem {
  id: number;
  name: string;
  user_id: number;
  username: string;
  type: number;
  public: number;
  unwell: number;
  status: number;
  createtime: number;
  updatetime: number;
  trending_score: number;
  score_multiplier: number;
  multiplier_expire_at: number; // unix 秒；0 表示未设置
}

// ==================== Feedback Management ====================

export interface FeedbackItem {
  id: number;
  reason: string;
  content: string;
  client_ip: string;
  createtime: number;
}

// ==================== Score Management ====================

export interface ScoreItem {
  id: number;
  user_id: number;
  username: string;
  script_id: number;
  script_name: string;
  score: number;
  message: string;
  createtime: number;
}

// ==================== OIDC Provider Management ====================

export interface OIDCProviderItem {
  id: number;
  name: string;
  type: string;
  issuer_url: string;
  auth_url: string;
  token_url: string;
  userinfo_url: string;
  client_id: string;
  client_secret: string;
  scopes: string;
  icon: string;
  display_order: number;
  status: number;
  createtime: number;
  updatetime: number;
}

export interface CreateOIDCProviderRequest {
  name: string;
  type?: string;
  issuer_url?: string;
  auth_url?: string;
  token_url?: string;
  userinfo_url?: string;
  client_id: string;
  client_secret: string;
  scopes?: string;
  icon?: string;
  display_order?: number;
}

export interface UpdateOIDCProviderRequest {
  name: string;
  type?: string;
  issuer_url?: string;
  auth_url?: string;
  token_url?: string;
  userinfo_url?: string;
  client_id: string;
  client_secret: string;
  scopes?: string;
  icon?: string;
  display_order?: number;
  status: number;
}

export interface OIDCDiscoverResponse {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  scopes_supported: string;
}

// ==================== Report Management ====================

export interface AdminReportItem {
  id: number;
  script_id: number;
  script_name: string;
  user_id: number;
  username: string;
  reason: string;
  comment_count: number;
  status: number;
  createtime: number;
  updatetime: number;
}

// ==================== Script Audit ====================

export interface ScriptAuditItem {
  id: number;
  script_id: number;
  code_id: number;
  submitter_id: number;
  submitter: string;
  submitter_credit: number;
  script_name: string;
  version: string;
  status: number; // 1=pending, 2=approved, 3=rejected
  reason: string;
  createtime: number;
}

export interface ScriptAuditDetail extends ScriptAuditItem {
  code: string;
  meta: string;
  changelog: string;
}

// ==================== Credit Logs ====================

export interface CreditLogItem {
  id: number;
  action: string;
  delta: number;
  new_score: number;
  reason: string;
  operator_id: number;
  related_id: number;
  createtime: number;
}

// ==================== Migrate Credit ====================

export interface MigrateCreditStatus {
  running: boolean;
  processed: number;
  skipped: number;
  failed: number;
  last_id: number;
  message: string;
}

export interface MigrateCreditTriggerResponse extends MigrateCreditStatus {
  started: boolean;
}

// ==================== Migrate Avatar ====================

export interface MigrateAvatarStatus {
  running: boolean;
  migrated: number;
  skipped: number;
  failed: number;
  total: number;
  message: string;
}

// 用户被处理过的脚本条目（管理员视角）
export interface ProcessedScriptItem {
  id: number;
  action: 'script_delete' | 'script_audit_rejected' | string;
  operator_id: number;
  operator_name: string;
  script_id: number;
  script_name: string;
  script_status: number;
  reason: string;
  createtime: number;
}

class AdminService {
  private readonly basePath = '/admin';

  // OAuth Apps
  async listOAuthApps(page: number = 1, size: number = 20) {
    return apiClient.get<ListData<OAuthAppItem>>(
      `${this.basePath}/oauth-apps`,
      { page, size },
    );
  }

  async createOAuthApp(data: CreateOAuthAppRequest) {
    return apiClient.post<CreateOAuthAppResponse>(
      `${this.basePath}/oauth-apps`,
      data,
    );
  }

  async updateOAuthApp(id: number, data: UpdateOAuthAppRequest) {
    return apiClient.put<void>(`${this.basePath}/oauth-apps/${id}`, data);
  }

  async deleteOAuthApp(id: number) {
    return apiClient.delete<void>(`${this.basePath}/oauth-apps/${id}`);
  }

  async resetOAuthAppSecret(id: number) {
    return apiClient.post<CreateOAuthAppResponse>(
      `${this.basePath}/oauth-apps/${id}/secret`,
    );
  }

  // System Config
  async getSystemConfigs(prefix?: string) {
    return apiClient.get<GetSystemConfigsResponse>(
      `${this.basePath}/system-configs`,
      prefix ? { prefix } : undefined,
    );
  }

  async updateSystemConfigs(configs: SystemConfigItem[]) {
    return apiClient.put<void>(`${this.basePath}/system-configs`, {
      configs,
    });
  }

  // User Management
  async listUsers(page: number = 1, size: number = 20, keyword?: string) {
    return apiClient.get<ListData<UserItem>>(`${this.basePath}/users`, {
      page,
      size,
      keyword,
    });
  }

  async updateUserStatus(
    id: number,
    status: number,
    options?: {
      reason?: string;
      expire_at?: number;
      clean_scores?: boolean;
      clean_scripts?: boolean;
    },
  ) {
    return apiClient.put<void>(`${this.basePath}/users/${id}/status`, {
      status,
      ...options,
    });
  }

  async updateUserAdminLevel(id: number, admin_level: number) {
    return apiClient.put<void>(`${this.basePath}/users/${id}/admin-level`, {
      admin_level,
    });
  }

  async listUserProcessedScripts(
    userId: number,
    params?: { page?: number; size?: number },
  ) {
    return apiClient.get<ListData<ProcessedScriptItem>>(
      `${this.basePath}/users/${userId}/processed-scripts`,
      params,
    );
  }

  // Script Management
  async listScripts(
    page: number = 1,
    size: number = 20,
    keyword?: string,
    status?: number,
    searchField?: 'name' | 'description' | 'content',
    sortField?: 'trending_score',
    sortOrder?: 'asc' | 'desc',
  ) {
    return apiClient.get<ListData<ScriptItem>>(`${this.basePath}/scripts`, {
      page,
      size,
      keyword,
      status,
      search_field: searchField,
      sort_field: sortField,
      sort_order: sortOrder,
    });
  }

  async restoreScript(id: number) {
    return apiClient.put<void>(`${this.basePath}/scripts/${id}/restore`);
  }

  async updateScriptTrendingScore(id: number, trendingScore: number) {
    return apiClient.put<void>(
      `${this.basePath}/scripts/${id}/trending-score`,
      {
        trending_score: trendingScore,
      },
    );
  }

  async setScriptScoreMultiplier(
    id: number,
    multiplier: number,
    expireAt: number,
  ) {
    return apiClient.put<void>(
      `${this.basePath}/scripts/${id}/score-multiplier`,
      {
        multiplier,
        expire_at: expireAt,
      },
    );
  }

  async clearScriptScoreMultiplier(id: number) {
    return apiClient.delete<void>(
      `${this.basePath}/scripts/${id}/score-multiplier`,
    );
  }

  // Feedback Management
  async listFeedbacks(page: number = 1, size: number = 20) {
    return apiClient.get<ListData<FeedbackItem>>(`${this.basePath}/feedbacks`, {
      page,
      size,
    });
  }

  async deleteFeedback(id: number) {
    return apiClient.delete<void>(`${this.basePath}/feedbacks/${id}`);
  }

  // Score Management
  async listScores(
    page: number = 1,
    size: number = 20,
    scriptId?: number,
    keyword?: string,
  ) {
    return apiClient.get<ListData<ScoreItem>>(`${this.basePath}/scores`, {
      page,
      size,
      script_id: scriptId,
      keyword,
    });
  }

  // OIDC Provider Management
  async listOIDCProviders(page: number = 1, size: number = 20) {
    return apiClient.get<ListData<OIDCProviderItem>>(
      `${this.basePath}/oidc-providers`,
      { page, size },
    );
  }

  async createOIDCProvider(data: CreateOIDCProviderRequest) {
    return apiClient.post<{ id: number }>(
      `${this.basePath}/oidc-providers`,
      data,
    );
  }

  async updateOIDCProvider(id: number, data: UpdateOIDCProviderRequest) {
    return apiClient.put<void>(`${this.basePath}/oidc-providers/${id}`, data);
  }

  async deleteOIDCProvider(id: number) {
    return apiClient.delete<void>(`${this.basePath}/oidc-providers/${id}`);
  }

  // OIDC Discovery
  async discoverOIDCConfig(issuerUrl: string) {
    return apiClient.post<OIDCDiscoverResponse>(
      `${this.basePath}/oidc-providers/discover`,
      { issuer_url: issuerUrl },
    );
  }

  // Migrate Avatar
  async migrateAvatar() {
    return apiClient.post<void>(`${this.basePath}/migrate-avatar`);
  }

  async getMigrateAvatarStatus() {
    return apiClient.get<MigrateAvatarStatus>(
      `${this.basePath}/migrate-avatar/status`,
    );
  }

  // Ranking: trending_score 手动重算
  async recomputeTrendingScore() {
    return apiClient.post<{ started: boolean; message: string }>(
      `${this.basePath}/ranking/recompute-trending`,
    );
  }

  // Script Audit Management
  async listScriptAudits(
    page: number = 1,
    size: number = 20,
    status?: number,
    submitterId?: number,
  ) {
    return apiClient.get<ListData<ScriptAuditItem>>(
      `${this.basePath}/script-audits`,
      { page, size, status, submitter_id: submitterId },
    );
  }

  async getScriptAudit(id: number) {
    return apiClient.get<ScriptAuditDetail>(
      `${this.basePath}/script-audits/${id}`,
    );
  }

  async approveScriptAudit(id: number) {
    return apiClient.put<void>(`${this.basePath}/script-audits/${id}/approve`);
  }

  async rejectScriptAudit(id: number, reason: string) {
    return apiClient.put<void>(`${this.basePath}/script-audits/${id}/reject`, {
      reason,
    });
  }

  // Credit Management
  async adjustCredit(userId: number, delta: number, reason: string) {
    return apiClient.post<void>(`${this.basePath}/users/${userId}/credit`, {
      delta,
      reason,
    });
  }

  async listUserCreditLogs(
    userId: number,
    page: number = 1,
    size: number = 20,
  ) {
    return apiClient.get<ListData<CreditLogItem>>(
      `${this.basePath}/users/${userId}/credit/logs`,
      { page, size },
    );
  }

  async migrateCredit() {
    return apiClient.post<MigrateCreditTriggerResponse>(
      `${this.basePath}/migrate-credit`,
    );
  }

  async getMigrateCreditStatus() {
    return apiClient.get<MigrateCreditStatus>(
      `${this.basePath}/migrate-credit/status`,
    );
  }

  // Report Management
  async listReports(page: number = 1, size: number = 20, status?: number) {
    return apiClient.get<ListData<AdminReportItem>>(
      `${this.basePath}/reports`,
      { page, size, status },
    );
  }

  // OIDC Icon Upload
  async uploadOIDCIcon(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('comment', 'oidc-icon');
    formData.append('link_id', '0');
    return apiClient.post<{ id: string }>('/resource/image', formData);
  }
}

export const adminService = new AdminService();
