import useSWR from 'swr';
import type { APIError } from '@/types/api';
import {
  type AuditLogListParams,
  type AuditLogListResponse,
  auditLogService,
} from '../services/auditLog';

/**
 * 全局管理日志
 * params 传 null 时不发起请求
 */
export function useAuditLogList(
  params: AuditLogListParams | null,
  fallbackData?: AuditLogListResponse,
) {
  const key = params ? ['audit-log-list', params] : null;

  return useSWR<AuditLogListResponse, APIError>(
    key,
    async () => auditLogService.list(params!),
    {
      fallbackData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 1000,
    },
  );
}

/**
 * 单脚本管理日志
 * params 传 null 时不发起请求
 */
export function useScriptAuditLogList(
  scriptId: number,
  params: AuditLogListParams | null,
  fallbackData?: AuditLogListResponse,
) {
  const key = params ? ['script-audit-log-list', scriptId, params] : null;

  return useSWR<AuditLogListResponse, APIError>(
    key,
    async () => auditLogService.scriptList(scriptId, params!),
    {
      fallbackData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 1000,
    },
  );
}
