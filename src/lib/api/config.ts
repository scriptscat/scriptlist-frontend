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
  // 上传走慢速上行链路时 20s 不够（几百 KB 就可能超时），且有进度条可见，放宽到 5 分钟
  uploadTimeout: 300000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  // 添加默认请求配置
  defaultRequestInit: {
    credentials: 'include' as RequestCredentials, // 包含Cookie
  },
} as const;
