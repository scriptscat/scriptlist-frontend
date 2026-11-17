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
  // AI 首字延迟经常超过默认的 20s；比后端 60s 的测试超时留一点余量，
  // 让服务端的失败原因先到前端，而不是被客户端提前 abort 成「请求超时」。
  aiTestTimeout: 70000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  // 添加默认请求配置
  defaultRequestInit: {
    credentials: 'include' as RequestCredentials, // 包含Cookie
  },
} as const;
