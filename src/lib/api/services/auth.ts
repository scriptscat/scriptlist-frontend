import { apiClient } from '../client';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  turnstile_token?: string;
}

export interface LoginByEmailRequest {
  account: string;
  password: string;
  turnstile_token?: string;
}

export interface VerifyEmailRequest {
  token: string;
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

  async register(data: RegisterRequest) {
    return apiClient.post<void>(`${this.basePath}/register`, data);
  }

  async login(data: LoginByEmailRequest) {
    return apiClient.post<void>(`${this.basePath}/login`, data);
  }

  async verifyEmail(data: VerifyEmailRequest) {
    return apiClient.post<void>(`${this.basePath}/verify-email`, data);
  }

  async forgotPassword(data: ForgotPasswordRequest) {
    return apiClient.post<void>(`${this.basePath}/forgot-password`, data);
  }

  async resetPassword(data: ResetPasswordRequest) {
    return apiClient.post<void>(`${this.basePath}/reset-password`, data);
  }
}

export const authService = new AuthService();
