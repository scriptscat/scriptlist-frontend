import useSWR from 'swr';
import { APIError, ListData, GroupMember, ScriptGroup } from '@/types/api';
import {
  InviteListItem,
  AccessRoleItem,
  Category,
} from '@/app/[locale]/script-show-page/[id]/types';
import scriptService, { scriptAccessService } from '../services/scripts';
import { scriptIssueService } from '../services/scripts/issue';
import {
  ScoreListItem,
  ScoreListParam,
  MyScoreResponse,
  ScriptVersion,
  VersionListRequest,
  VersionListResponse,
} from '../services/scripts/scripts';
import { Statistics, Realtime } from '../services/scripts/statistics';

/**
 * 脚本评分列表Hook
 * @param scriptId - 脚本ID
 * @param params - 查询参数
 * @param initialData - 初始数据（用于SSR）
 * @returns 评分列表数据
 */
export function useScoreList(
  scriptId: number,
  params?: ScoreListParam,
  initialData?: ListData<ScoreListItem> | null,
) {
  const key = ['score-list', scriptId, params];

  return useSWR<ListData<ScoreListItem>, APIError>(
    key,
    () => scriptService.getScoreList(scriptId, params),
    {
      fallbackData: initialData || undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 邀请码列表Hook
 * @param id - 脚本ID
 * @param page - 页码
 * @param groupID - 用户组ID
 * @param sort - 排序配置
 * @returns 邀请码列表数据
 */
export function useInviteList(
  id: number,
  page: number = 1,
  groupID?: number,
  sort?: { field: string; order: string },
) {
  const key = ['invite-list', id, page, groupID, sort];

  return useSWR<ListData<InviteListItem>, APIError>(
    key,
    () => scriptAccessService.getInviteList(id, page, groupID, sort),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 访问权限用户列表Hook
 * @param id - 脚本ID
 * @param page - 页码
 * @returns 访问权限用户列表数据
 */
export function useAccessRoleList(id: number, page: number = 1) {
  const key = ['access-role-list', id, page];

  return useSWR<ListData<AccessRoleItem>, APIError>(
    key,
    () => scriptAccessService.getAccessRoleList(id, page),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 脚本用户组列表Hook
 * @param id - 脚本ID
 * @param page - 页码
 * @returns 脚本用户组列表数据
 */
export function useScriptGroupList(id: number, page: number = 1) {
  const key = ['script-group-list', id, page];

  return useSWR<ListData<ScriptGroup>, APIError>(
    key,
    () => scriptAccessService.getScriptGroupList(id, page),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 用户组成员列表Hook
 * @param id - 脚本ID
 * @param gid - 用户组ID
 * @param page - 页码
 * @returns 用户组成员列表数据
 */
export function useGroupMemberList(id: number, gid: number, page: number = 1) {
  const key = ['group-member-list', id, gid, page];

  return useSWR<ListData<GroupMember>, APIError>(
    key,
    () => scriptAccessService.getGroupMemberList(id, gid, page),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 分类列表Hook
 * @returns 脚本分类列表
 */
export function useCategoryList() {
  return useSWR<{ categories: Category[] }, APIError>(
    '/scripts/category',
    () => scriptService.getCategoryList(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 检查是否关注Issue Hook
 * @param scriptId - 脚本ID
 * @param issueId - Issue ID
 * @param enabled - 是否启用请求（用户登录时才请求）
 * @returns 是否关注Issue的状态
 */
export function useIsWatchIssue(
  scriptId: number,
  issueId: number,
  enabled: boolean = true,
) {
  const key = enabled ? ['is-watch-issue', scriptId, issueId] : null;

  return useSWR<boolean, APIError>(
    key,
    () => scriptIssueService.isWatchIssue(scriptId, issueId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

/**
 * 获取用户对脚本的评分Hook
 * @param scriptId - 脚本ID
 * @param enabled - 是否启用请求（用户登录时才请求）
 * @returns 用户的评分数据
 */
export function useMyScore(scriptId: number, enabled: boolean = true) {
  const key = enabled ? ['my-score', scriptId] : null;

  return useSWR<MyScoreResponse, APIError>(
    key,
    async () => {
      const response = await scriptService.getMyScore(scriptId);
      return response;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false, // 404错误时不重试
    },
  );
}

/**
 * 脚本统计数据Hook
 * @param scriptId - 脚本ID
 * @returns 统计数据
 */
export function useScriptStatistics(scriptId: number) {
  const key = ['script-statistics', scriptId];

  return useSWR<Statistics, APIError>(
    key,
    async () => {
      const { scriptStatisticsService } = await import('../services/scripts/statistics');
      return scriptStatisticsService.getStatistics(scriptId);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 5 * 60 * 1000, // 5分钟刷新一次
    },
  );
}

/**
 * 脚本实时统计数据Hook
 * @param scriptId - 脚本ID
 * @param enabled - 是否启用实时更新
 * @returns 实时统计数据
 */
export function useScriptRealtime(scriptId: number, enabled: boolean = true) {
  const key = enabled ? ['script-realtime', scriptId] : null;

  return useSWR<Realtime, APIError>(
    key,
    async () => {
      const { scriptStatisticsService } = await import('../services/scripts/statistics');
      return scriptStatisticsService.getRealtime(scriptId);
    },
    {
      refreshInterval: enabled ? 5000 : 0, // 5秒刷新一次
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

