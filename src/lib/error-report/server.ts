import { systemService } from '@/lib/api/services/system';
import { buildPayload, isControlFlowError, localeFromPath } from './core';
import type { ClientErrorPayload } from './core';

/** `onRequestError` 给出的请求信息 */
export interface ServerRequestInfo {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
}

export interface ServerErrorReport {
  payload: ClientErrorPayload;
  headers: Record<string, string>;
}

// 转发访客身份：后端的限流与日志才会记在访客头上，而不是前端 pod
const FORWARDED_HEADERS: Record<string, string> = {
  cookie: 'Cookie',
  'x-forwarded-for': 'X-Forwarded-For',
  'x-real-ip': 'X-Real-IP',
  'user-agent': 'User-Agent',
};

export function buildServerErrorReport(
  error: unknown,
  request: ServerRequestInfo,
): ServerErrorReport | null {
  if (isControlFlowError(error)) {
    return null;
  }

  const queryStart = request.path.indexOf('?');
  const pathname =
    queryStart === -1 ? request.path : request.path.slice(0, queryStart);
  const search = queryStart === -1 ? '' : request.path.slice(queryStart);
  const isError = error instanceof Error;

  const headers: Record<string, string> = {};
  for (const [name, forwardAs] of Object.entries(FORWARDED_HEADERS)) {
    const value = request.headers[name];
    if (value) {
      headers[forwardAs] = Array.isArray(value) ? value.join(', ') : value;
    }
  }

  return {
    payload: buildPayload(
      {
        kind: 'ssr',
        message: isError ? error.message : String(error),
        stack: isError ? error.stack : undefined,
        digest: (error as { digest?: string } | null)?.digest,
      },
      {
        pathname,
        search,
        locale: localeFromPath(pathname),
        build: process.env.NEXT_PUBLIC_BUILD_ID,
      },
    ),
    headers,
  };
}

/** 上报一次服务端渲染错误；任何失败都吞掉，不能影响原请求。 */
export async function reportServerError(
  error: unknown,
  request: ServerRequestInfo,
): Promise<void> {
  try {
    const report = buildServerErrorReport(error, request);
    if (!report) {
      return;
    }
    await systemService.reportClientError(report.payload, {
      headers: report.headers,
      timeout: 3000,
    });
  } catch {
    // 上报是旁路
  }
}
