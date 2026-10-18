import type { APIRequestInfo } from '@/types/api';

export type ClientErrorKind = 'boundary' | 'uncaught' | 'rejection' | 'ssr';

/** 上报给后端的请求体，字段与长度上限同后端 `ReportClientErrorRequest`。 */
export interface ClientErrorPayload {
  kind: ClientErrorKind;
  message: string;
  stack?: string;
  digest?: string;
  error_id?: string;
  url: string;
  locale?: string;
  build?: string;
  translated?: boolean;
}

export interface ErrorReportInput {
  kind: ClientErrorKind;
  message: string;
  stack?: string;
  digest?: string;
  /** 错误页上显示给用户的错误 ID */
  errorId?: string;
  /** 抛出错误的脚本地址（`ErrorEvent.filename`） */
  source?: string;
  /** 附在消息后的补充信息（如失败的接口）；不参与去重 */
  detail?: string;
}

export interface ReportContext {
  pathname: string;
  search: string;
  locale?: string;
  build?: string;
  translated?: boolean;
}

// 与后端 `ReportClientErrorRequest` 的 binding 上限保持一致，超长会被整条拒绝。
const LIMITS = {
  message: 1000,
  stack: 8000,
  digest: 64,
  errorId: 32,
  url: 1000,
  locale: 16,
  build: 64,
} as const;

const DEFAULT_MAX_REPORTS = 5;

// 值可能是一次性凭证（OAuth 回调等），只保留参数名
const SENSITIVE_PARAMS = ['code', 'token', 'state'];

const EXTENSION_URL =
  /\b(?:chrome|moz|safari|safari-web|ms-browser)-extension:\/\//;

// notFound()/redirect() 等是靠抛错实现的导航控制流，不是错误
const CONTROL_FLOW_DIGESTS = [
  'NEXT_REDIRECT',
  'NEXT_NOT_FOUND',
  'NEXT_HTTP_ERROR_FALLBACK',
  'DYNAMIC_SERVER_USAGE',
  'BAILOUT_TO_CLIENT_SIDE_RENDERING',
];

const LOCALE_PREFIX = /^\/([a-z]{2,3}(?:-[A-Za-z]{2,4})?)(?:\/|$)/;

/** 从路径前缀取页面语言；不读 `<html lang>`，浏览器翻译会改写它。 */
export function localeFromPath(pathname: string): string | undefined {
  return LOCALE_PREFIX.exec(pathname)?.[1];
}

export function generateErrorId(): string {
  return Math.random().toString(36).slice(2, 11).toUpperCase().padEnd(9, '0');
}

export function sanitizeUrl(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.delete('_rsc');
  for (const name of SENSITIVE_PARAMS) {
    if (params.has(name)) {
      params.set(name, '');
    }
  }
  const query = params.toString();
  return (query ? `${pathname}?${query}` : pathname).slice(0, LIMITS.url);
}

export function shouldIgnoreError(
  input: Pick<ErrorReportInput, 'message' | 'stack' | 'source'>,
): boolean {
  // 跨域脚本的错误被浏览器抹成这一句，没有任何可排查的信息
  if (/^Script error\.?$/i.test(input.message.trim())) {
    return true;
  }
  if (/ResizeObserver loop/i.test(input.message)) {
    return true;
  }
  return (
    EXTENSION_URL.test(input.stack ?? '') ||
    EXTENSION_URL.test(input.source ?? '')
  );
}

export function isPageTranslated(doc: {
  documentElement: { classList: { contains(name: string): boolean } };
  querySelector(selector: string): unknown;
}): boolean {
  const { classList } = doc.documentElement;
  // Chrome 内置翻译给 <html> 加 translated-ltr/rtl；Edge 给被改写的节点加 _msttexthash
  return (
    classList.contains('translated-ltr') ||
    classList.contains('translated-rtl') ||
    doc.querySelector('[_msttexthash]') !== null
  );
}

export function isControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === 'string' &&
    CONTROL_FLOW_DIGESTS.some((prefix) => digest.startsWith(prefix))
  );
}

/**
 * 请求失败的错误只有「请求超时」这类消息，看不出是哪个接口；
 * 取出 `APIError.request` 里记下的方法、路径、状态码与耗时。
 */
export function requestDetail(error: unknown): string | undefined {
  const { request, statusCode } = (error ?? {}) as {
    request?: APIRequestInfo;
    statusCode?: number;
  };
  if (!request) {
    return undefined;
  }
  const parts = [
    request.method,
    request.endpoint,
    `status=${statusCode}`,
    `${request.duration}ms`,
  ];
  if (request.contentType && !request.contentType.includes('json')) {
    parts.push(`content-type=${request.contentType}`);
  }
  return parts.join(' ');
}

export function buildPayload(
  input: ErrorReportInput,
  context: ReportContext,
): ClientErrorPayload {
  const message = input.message || 'Unknown error';
  return {
    kind: input.kind,
    message: (input.detail ? `${message} [${input.detail}]` : message).slice(
      0,
      LIMITS.message,
    ),
    stack: input.stack?.slice(0, LIMITS.stack),
    digest: input.digest?.slice(0, LIMITS.digest),
    error_id: input.errorId?.slice(0, LIMITS.errorId),
    url: sanitizeUrl(context.pathname, context.search),
    locale: context.locale?.slice(0, LIMITS.locale),
    build: context.build?.slice(0, LIMITS.build),
    translated: context.translated,
  };
}

/**
 * 创建一个按「一次页面加载」计数的上报函数：相同错误只报一次、总数封顶，
 * 且任何失败都吞掉——上报是旁路，不能反过来制造新的错误。
 */
export function createReporter(options: {
  send: (payload: ClientErrorPayload) => unknown;
  getContext: () => ReportContext;
  maxReports?: number;
}): (input: ErrorReportInput) => boolean {
  const maxReports = options.maxReports ?? DEFAULT_MAX_REPORTS;
  const seen = new Set<string>();
  let sent = 0;

  return (input) => {
    try {
      if (sent >= maxReports || shouldIgnoreError(input)) {
        return false;
      }
      const key = `${input.message}\n${input.stack ?? ''}`;
      if (seen.has(key)) {
        return false;
      }
      const payload = buildPayload(input, options.getContext());
      seen.add(key);
      sent += 1;
      options.send(payload);
      return true;
    } catch {
      return false;
    }
  };
}
