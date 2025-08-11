/**
 * API配置
 */
export const API_CONFIG = {
  // 使用现有的环境变量配置
  baseURL:
    process.env.APP_API_URL ||
    process.env.NEXT_PUBLIC_APP_URL + '/api/v2' ||
    '',
  timeout: 20000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  // 添加默认请求配置
  defaultRequestInit: {
    credentials: 'include' as RequestCredentials, // 包含Cookie
  },
} as const;
