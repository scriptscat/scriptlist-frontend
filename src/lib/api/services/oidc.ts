import { apiClient } from '../client';

export interface OIDCProviderInfo {
  id: number;
  name: string;
  icon: string;
  type: string;
}

export interface OIDCProvidersResponse {
  providers: OIDCProviderInfo[];
}

export interface OIDCBindInfoResponse {
  provider_name: string;
  email: string;
  name: string;
  picture: string;
}

export interface OIDCBindConfirmRequest {
  bind_token: string;
  account: string;
  password: string;
}

export interface OIDCRegisterAndBindRequest {
  bind_token: string;
  email: string;
  username: string;
  password: string;
  code: string;
  agree_terms: boolean;
}

export interface UserOAuthBindItem {
  id: number;
  provider: string;
  provider_name: string;
  provider_username: string;
  createtime: number;
}

export interface UserOAuthListResponse {
  items: UserOAuthBindItem[];
}

class OIDCService {
  async getProviders() {
    return apiClient.get<OIDCProvidersResponse>('/auth/oidc/providers');
  }

  async getBindInfo(bindToken: string) {
    return apiClient.get<OIDCBindInfoResponse>('/auth/oidc/bindinfo', {
      bind_token: bindToken,
    });
  }

  async bindConfirm(data: OIDCBindConfirmRequest) {
    return apiClient.post<void>('/auth/oidc/bindconfirm', data);
  }

  async registerAndBind(data: OIDCRegisterAndBindRequest) {
    return apiClient.post<void>('/auth/oidc/register', data);
  }

  async getBindList() {
    return apiClient.get<UserOAuthListResponse>('/users/oauth/bindlist');
  }

  async unbind(id: number) {
    return apiClient.delete<void>(`/users/oauth/bind/${id}`);
  }
}

export const oidcService = new OIDCService();
