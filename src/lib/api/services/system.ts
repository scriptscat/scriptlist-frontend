import { apiClient } from '../client';
import type { RequestOptions } from '../client';
import type { ClientErrorPayload } from '@/lib/error-report/core';

export interface GlobalConfig {
  turnstile_site_key: string;
  qq_migrate_enabled: boolean;
  /** AdSense 发布商 ID（ca-pub-…）；未配置时为空字符串，此时全站不加载 AdSense 脚本。 */
  adsense_publisher_id: string;
}

class SystemService {
  private readonly basePath = '/system';

  async getGlobalConfig() {
    return apiClient.get<GlobalConfig>('/global-config');
  }

  /** 上报一次前端错误（浏览器端或服务端渲染）；后端只写日志。 */
  async reportClientError(
    payload: ClientErrorPayload,
    options?: RequestOptions,
  ) {
    return apiClient.post<Record<string, never>>(
      `${this.basePath}/client-errors`,
      payload,
      options,
    );
  }
}

export const systemService = new SystemService();
