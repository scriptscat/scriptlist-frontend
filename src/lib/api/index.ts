// 导出API客户端
export { apiClient, APIClient } from './client';

// 导出配置
export { API_CONFIG } from './config';

// 导出服务
export { userService } from './services/user';
export { resourceService } from './services/resource';

// 导出hooks
export * from './hooks/user';
export * from './hooks/userSettings';

// 导出所有API相关类型
export * from '@/types/api';

// 导入apiClient用于向后兼容
import { apiClient } from './client';

// 向后兼容的API导出
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
};
