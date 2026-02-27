import type { ListData } from '@/types/api';
import { apiClient } from '../client';

export interface OAuthAppItem {
  id: number;
  client_id: string;
  name: string;
  description: string;
  redirect_uri: string;
  status: number;
  createtime: number;
  updatetime: number;
}

export interface CreateOAuthAppRequest {
  name: string;
  description: string;
  redirect_uri: string;
}

export interface CreateOAuthAppResponse {
  id: number;
  client_id: string;
  client_secret: string;
}

export interface UpdateOAuthAppRequest {
  name: string;
  description: string;
  redirect_uri: string;
  status: number;
}

class AdminService {
  private readonly basePath = '/admin';

  async listOAuthApps(page: number = 1, size: number = 20) {
    return apiClient.get<ListData<OAuthAppItem>>(
      `${this.basePath}/oauth-apps`,
      { page, size },
    );
  }

  async createOAuthApp(data: CreateOAuthAppRequest) {
    return apiClient.post<CreateOAuthAppResponse>(
      `${this.basePath}/oauth-apps`,
      data,
    );
  }

  async updateOAuthApp(id: number, data: UpdateOAuthAppRequest) {
    return apiClient.put<void>(`${this.basePath}/oauth-apps/${id}`, data);
  }

  async deleteOAuthApp(id: number) {
    return apiClient.delete<void>(`${this.basePath}/oauth-apps/${id}`);
  }
}

export const adminService = new AdminService();
