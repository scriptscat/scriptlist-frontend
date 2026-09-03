import { useCallback } from 'react';
import useSWR from 'swr';
import type { Key } from 'swr';
import type { APIError, ListData } from '@/types/api';
import { adminService } from '../services/admin';
import type {
  AdminReportItem,
  FeedbackItem,
  OAuthAppItem,
  OIDCProviderItem,
  ScoreItem,
  ScriptAuditItem,
  ScriptItem,
  UserItem,
} from '../services/admin';
import { advertiseService } from '../services/advertise';
import type { AdminAdvertise, AdType } from '../services/advertise';
import { announcementService } from '../services/announcement';
import type { AdminAnnouncement } from '../services/announcement';
import { useResource } from './useResource';

/** 管理后台列表页的默认每页条数，与各页表格的 `pageSize` 保持一致。 */
export const ADMIN_PAGE_SIZE = 20;

export interface AdminListResult<T> {
  list: T[];
  total: number;
  /** 屏幕上还没有任何行可画 —— 表格该整体进入加载态。 */
  isLoading: boolean;
  /** 已有旧数据，正在后台取新的（翻页、改筛选、手动刷新）。 */
  isRefreshing: boolean;
  error: APIError | undefined;
  refresh: () => void;
}

/**
 * 管理后台列表的统一取数入口。
 *
 * 存在的理由：这些页面原本各自手搓 `useState(false)` + `useEffect` + `try/catch`，
 * 于是共享同三个缺陷 —— 首帧 `loading=false` 且 `data=[]`，先画一次「暂无数据」；
 * 失败只弹 3 秒 toast，表格永久停在空态；非 `APIError` 的失败（断网、20 秒超时）
 * 被整个吞掉。SWR 的 `isLoading` 首帧即为 true，`error` 不区分错误类型，
 * 两个缺陷从结构上消失。
 */
export function useAdminList<T>(
  key: Key,
  fetcher: () => Promise<ListData<T>>,
): AdminListResult<T> {
  const swr = useSWR<ListData<T>, APIError>(key, fetcher);
  const { data, isInitialLoading, isRefreshing, error } = useResource(swr);
  const { mutate } = swr;

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return {
    list: data?.list ?? [],
    total: data?.total ?? 0,
    isLoading: isInitialLoading,
    isRefreshing,
    error,
    refresh,
  };
}

// ==================== 用户 ====================

export function useAdminUsers(params: {
  page: number;
  size?: number;
  keyword?: string;
}): AdminListResult<UserItem> {
  const { page, size = ADMIN_PAGE_SIZE, keyword } = params;
  const kw = keyword || undefined;
  return useAdminList(['admin-users', page, size, kw ?? ''], () =>
    adminService.listUsers(page, size, kw),
  );
}

// ==================== 举报 ====================

export function useAdminReports(params: {
  page: number;
  size?: number;
  status?: number;
}): AdminListResult<AdminReportItem> {
  const { page, size = ADMIN_PAGE_SIZE, status } = params;
  return useAdminList(['admin-reports', page, size, status ?? null], () =>
    adminService.listReports(page, size, status),
  );
}

// ==================== 脚本 ====================

export interface AdminScriptsParams {
  page: number;
  size?: number;
  keyword?: string;
  status?: number;
  searchField?: 'name' | 'description' | 'content';
  sortField?: 'trending_score';
  sortOrder?: 'asc' | 'desc';
}

export function useAdminScripts(
  params: AdminScriptsParams,
): AdminListResult<ScriptItem> {
  const {
    page,
    size = ADMIN_PAGE_SIZE,
    keyword,
    status,
    searchField,
    sortField,
    sortOrder,
  } = params;
  const kw = keyword || undefined;
  return useAdminList(
    [
      'admin-scripts',
      page,
      size,
      kw ?? '',
      status ?? null,
      kw ? (searchField ?? null) : null,
      sortField ?? null,
      sortOrder ?? null,
    ],
    () =>
      adminService.listScripts(
        page,
        size,
        kw,
        status,
        kw ? searchField : undefined,
        sortField,
        sortOrder,
      ),
  );
}

// ==================== 反馈 ====================

export function useAdminFeedbacks(params: {
  page: number;
  size?: number;
  keyword?: string;
  reason?: string;
  hideEmpty?: boolean;
}): AdminListResult<FeedbackItem> {
  const {
    page,
    size = ADMIN_PAGE_SIZE,
    keyword,
    reason,
    hideEmpty = false,
  } = params;
  const kw = keyword || undefined;
  const rs = reason || undefined;
  return useAdminList(
    ['admin-feedbacks', page, size, kw ?? '', rs ?? '', hideEmpty],
    () =>
      adminService.listFeedbacks(page, size, kw, rs, hideEmpty || undefined),
  );
}

// ==================== 评分 ====================

export function useAdminScores(params: {
  page: number;
  size?: number;
  scriptId?: number;
  keyword?: string;
}): AdminListResult<ScoreItem> {
  const { page, size = ADMIN_PAGE_SIZE, scriptId, keyword } = params;
  const kw = keyword || undefined;
  return useAdminList(
    ['admin-scores', page, size, scriptId ?? null, kw ?? ''],
    () => adminService.listScores(page, size, scriptId, kw),
  );
}

// ==================== 脚本审核 ====================

export function useAdminScriptAudits(params: {
  page: number;
  size?: number;
  status?: number;
  scriptName?: string;
}): AdminListResult<ScriptAuditItem> {
  const { page, size = ADMIN_PAGE_SIZE, status, scriptName } = params;
  const name = scriptName || undefined;
  return useAdminList(
    ['admin-script-audits', page, size, status ?? null, name ?? ''],
    () =>
      adminService.listScriptAudits(
        page,
        size,
        status,
        undefined,
        undefined,
        name,
      ),
  );
}

// ==================== OAuth 应用 ====================

export function useAdminOAuthApps(params: {
  page: number;
  size?: number;
}): AdminListResult<OAuthAppItem> {
  const { page, size = ADMIN_PAGE_SIZE } = params;
  return useAdminList(['admin-oauth-apps', page, size], () =>
    adminService.listOAuthApps(page, size),
  );
}

// ==================== OIDC 提供方 ====================

export function useAdminOIDCProviders(params: {
  page: number;
  size?: number;
}): AdminListResult<OIDCProviderItem> {
  const { page, size = ADMIN_PAGE_SIZE } = params;
  return useAdminList(['admin-oidc-providers', page, size], () =>
    adminService.listOIDCProviders(page, size),
  );
}

// ==================== 公告 ====================

export function useAdminAnnouncements(params: {
  page: number;
  size?: number;
}): AdminListResult<AdminAnnouncement> {
  const { page, size = ADMIN_PAGE_SIZE } = params;
  return useAdminList(['admin-announcements', page, size], () =>
    announcementService.adminGetList(page, size),
  );
}

// ==================== 广告 ====================

export function useAdminAdvertises(params: {
  page: number;
  size?: number;
  slot?: string;
  enabled?: boolean;
  adType?: AdType;
}): AdminListResult<AdminAdvertise> {
  const { page, size = ADMIN_PAGE_SIZE, slot, enabled, adType } = params;
  return useAdminList(
    ['admin-advertises', page, size, slot ?? '', enabled ?? null, adType ?? ''],
    () => advertiseService.adminList(page, size, slot, enabled, adType),
  );
}
