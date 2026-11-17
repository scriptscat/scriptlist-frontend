import { systemService } from '@/lib/api/services/system';
import {
  buildPayload,
  isControlFlowError,
  localeFromPath,
  requestDetail,
} from './core';
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

/**
 * 不值得上报的服务端渲染「错误」：
 * - 页面抛出的 4xx 业务错误（脚本不存在 / 已删除 / 未登录）是预期结果，后端自己有记录；
 * - 访客在渲染途中断开连接。
 * 按 name 判断而不用 instanceof：instrumentation 与页面可能各打包了一份 APIError。
 */
function isExpectedServerError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.message === 'The destination stream closed early.') {
    return true;
  }
  const { statusCode } = error as { statusCode?: unknown };
  return (
    error.name === 'APIError' &&
    typeof statusCode === 'number' &&
    statusCode >= 400 &&
    statusCode < 500
  );
}

export function buildServerErrorReport(
  error: unknown,
  request: ServerRequestInfo,
): ServerErrorReport | null {
  if (isControlFlowError(error) || isExpectedServerError(error)) {
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
        detail: requestDetail(error),
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
