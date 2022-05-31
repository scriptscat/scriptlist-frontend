import { message } from 'antd';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

let instance: AxiosInstance = axios.create({
  baseURL: typeof window == 'undefined' ? process.env.APP_API_URL : '/v1/api',
  timeout: 300000,
  validateStatus: (status: number) => status < 500,
});

export interface Params {
  [key: string]: any;
}

export interface APIResponse {
  [key: string]: any;
  code: number;
  msg: string;
}

export interface APIDataResponse<T> extends APIResponse {
  data: T;
}

export interface APIListResponse<T> extends APIResponse {
  list: T[];
  total: number;
}

export function InitAxios(config: AxiosRequestConfig) {
  instance = axios.create(config);
  instance.interceptors.response.use(
    (res) => {
      return res;
    },
    (err) => {
      message.error('网络错误！请求失败！');
      return Promise.reject(err);
    }
  );
}

export function request<T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return instance.request(config);
}
