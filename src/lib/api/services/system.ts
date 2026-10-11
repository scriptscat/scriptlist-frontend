import { apiClient } from '../client';

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
}

export const systemService = new SystemService();
