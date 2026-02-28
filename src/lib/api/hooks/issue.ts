import useSWR from 'swr';
import type { APIError } from '@/types/api';
import {
  type IssueListParams,
  type IssueListResponse,
  scriptIssueService,
} from '../services/scripts/issue';

/**
 * 获取脚本Issue列表的hook
 * params 传 null 时不发起请求
 */
export function useIssueList(scriptId: number, params: IssueListParams | null) {
  const key = params ? ['issue-list', scriptId, params] : null;

  return useSWR<IssueListResponse, APIError>(
    key,
    async () => {
      return scriptIssueService.getIssueList(scriptId, params!);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 1000,
    },
  );
}
