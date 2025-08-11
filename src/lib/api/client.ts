import type { APIResponse } from '@/types/api';
import { APIError } from '@/types/api';
import { API_CONFIG } from './config';
import { isServerEnvironment } from '../utils/utils';

/**
 * 服务端Cookie工具函数
 */
export class ServerCookieUtils {
  /**
   * 从Next.js cookies中获取cookie值
   */
  static async getCookie(name: string): Promise<string | undefined> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  }

  /**
   * 设置cookie（服务端）
   */
  static async setCookie(
    name: string,
    value: string,
    options?: {
      expires?: Date;
      maxAge?: number;
      domain?: string;
      path?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    },
  ): Promise<void> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
      path: '/',
      ...options,
    });
  }

  /**
   * 删除cookie（服务端）
   */
  static async deleteCookie(name: string): Promise<void> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.delete(name);
  }

  /**
   * 获取所有cookie
   */
  static async getAllCookies(): Promise<Record<string, string>> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const result: Record<string, string> = {};

    cookieStore.getAll().forEach((cookie) => {
      result[cookie.name] = cookie.value;
    });

    return result;
  }

  /**
   * 构建cookie字符串（用于发送到API）
   */
  static async buildCookieString(): Promise<string> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
  }

  /**
   * 构建特定cookie的字符串
   */
  static buildCookieStringFromObject(cookies: Record<string, string>): string {
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }
}

/**
 * 请求选项
 */
export interface RequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, any>;
}

/**
 * API客户端类
 */
class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = API_CONFIG.defaultHeaders;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * 构建URL查询参数
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  /**
   * 构建完整URL
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = this.baseURL + endpoint;

    if (params) {
      const queryString = this.buildQueryString(params);
      return queryString ? `${url}?${queryString}` : url;
    }

    return url;
  }

  /**
   * 处理API响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let data: APIResponse<T>;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('响应不是有效的JSON格式');
      }
    } catch (error) {
      throw new APIError(response.status, -1, '解析响应数据失败', error);
    }

    // 检查业务状态码
    if (data.code !== 0) {
      throw new APIError(response.status, data.code, data.msg, data);
    }

    return data.data as T;
  }

  /**
   * 发起请求
   */
  private async _request(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<Response> {
    const { timeout = this.timeout, params, ...fetchOptions } = options;

    const url = this.buildURL(endpoint, params);

    const config: RequestInit = {
      ...API_CONFIG.defaultRequestInit,
      ...fetchOptions,
    };

    // 构建请求头
    const headers = new Headers();

    // 如果不是 FormData，添加默认的 Content-Type
    if (!(config.body instanceof FormData)) {
      Object.entries(this.defaultHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    // 添加自定义头
    if (config.headers) {
      const customHeaders = new Headers(config.headers);
      customHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }
    config.headers = headers;

    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.status) {
        throw new APIError(
          response.status,
          response.status,
          `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError(-1, 0, '请求超时');
        }
        throw new APIError(-1, 0, `网络错误: ${error.message}`);
      }

      throw new APIError(-1, 0, '未知错误');
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this._request(endpoint, options).then((resp) =>
      this.handleResponse<T>(resp),
    );
  }

  async requestWithCookie<T>(
    endpoint: string,
    options: RequestOptions & {
      cookies?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const { cookies } = options;
    if (isServerEnvironment()) {
      // 处理cookie
      let cookieString = '';
      // 构建请求头
      const headers = new Headers();

      // 添加自定义头
      if (options.headers) {
        const customHeaders = new Headers(options.headers);
        customHeaders.forEach((value, key) => {
          headers.set(key, value);
        });
      }

      // 包含所有cookie
      cookieString = await ServerCookieUtils.buildCookieString();
      // 添加额外的cookie
      if (cookies && Object.keys(cookies).length > 0) {
        const extraCookieString =
          ServerCookieUtils.buildCookieStringFromObject(cookies);
        cookieString = cookieString
          ? `${cookieString}; ${extraCookieString}`
          : extraCookieString;
      }
      if (cookieString) {
        headers.set('Cookie', cookieString);
      }
      options.headers = headers;

      const resp = await this._request(endpoint, options);
      return this.handleResponse<T>(resp);
    }
    return this.request<T>(endpoint, options);
  }

  /**
   * GET请求
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
    });
  }

  async getWithCookie<T>(endpoint: string, params?: Record<string, any>) {
    return this.requestWithCookie<T>(endpoint, {
      method: 'GET',
      params,
    });
  }

  /**
   * POST请求
   */
  async post<T>(
    endpoint: string,
    data?: FormData | any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data
        ? data instanceof FormData
          ? data
          : JSON.stringify(data)
        : undefined,
      ...options,
    });
  }

  /**
   * PUT请求
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data
        ? data instanceof FormData
          ? data
          : JSON.stringify(data)
        : undefined,
      ...options,
    });
  }

  /**
   * DELETE请求
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

// 导出单例实例
export const apiClient = new APIClient();

// 导出类型
export { APIClient };
