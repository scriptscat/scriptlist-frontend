import axios from "axios";
import qs from "qs";

export const baseURL =
  process.env.NODE_ENV === "production" || process.env.SERVER
    ? process.env.VUE_APP_HTTP_HOST
    : "/dev";
const service = axios.create({
  withCredentials: true,
  baseURL: baseURL,
  timeout: 30000
});

/**
 * GET 方法
 * url 提交地址
 * query 提交參數
 */
export async function get(url, config, cookies) {
  config = config || {};
  if (cookies) {
    config.headers = {
      cookie: "token=" + cookies.get('token')
    }
  }
  return service.get(url, config);
}

/**
 * POST 方法
 * url 提交地址
 * query 提交參數
 */
export async function post(url, data, config, cookies) {
  config = config || {};
  if (cookies) {
    config.headers = {
      cookie: "token=" + cookies.get('token')
    }
  }
  return service.post(url, data, config);
}

/**
 * PUT 方法
 * url 提交地址
 * query 提交參數
 */
export async function put(url, data, config, cookies) {
  config = config || {};
  if (cookies) {
    config.headers = {
      cookie: "token=" + cookies.get('token')
    }
  }
  return service.put(url, data, config);
}

