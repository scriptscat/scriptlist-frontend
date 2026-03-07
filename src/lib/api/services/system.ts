import { apiClient } from '../client';

export interface GlobalConfig {
  turnstile_site_key: string;
  qq_migrate_enabled: boolean;
}

class SystemService {
  private readonly basePath = '/system';

  async getGlobalConfig() {
    return apiClient.get<GlobalConfig>('/global-config');
  }
}

export const systemService = new SystemService();
