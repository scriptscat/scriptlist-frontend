import { apiClient } from '../client';

export interface SendRegisterCodeRequest {
  email: string;
  turnstile_token?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  code: string;
  agree_terms: boolean;
}

export interface LoginRequest {
  account: string;
  password: string;
  turnstile_token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  turnstile_token?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

class AuthService {
  private readonly basePath = '/auth';

  async sendRegisterCode(data: SendRegisterCodeRequest) {
    return apiClient.post<void>(`${this.basePath}/send-register-code`, data);
  }

  async register(data: RegisterRequest) {
    return apiClient.post<void>(`${this.basePath}/register`, data);
  }

  async login(data: LoginRequest) {
    return apiClient.post<void>(`${this.basePath}/login`, data);
  }

  async forgotPassword(data: ForgotPasswordRequest) {
    return apiClient.post<void>(`${this.basePath}/forgot-password`, data);
  }

  async resetPassword(data: ResetPasswordRequest) {
    return apiClient.post<void>(`${this.basePath}/reset-password`, data);
  }
}

export const authService = new AuthService();
