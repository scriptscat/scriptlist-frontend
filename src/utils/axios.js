import axios from "axios";
import qs from "qs";

const baseURL =
  process.env.NODE_ENV === "production" || process.env.SERVER
    ? process.env.VUE_APP_HTTP_HOST
    : "/dev";
const service = axios.create({
  baseURL: baseURL,
  timeout: 30000
});

/**
 * GET 方法
 * url 提交地址
 * query 提交參數
 */
export async function get(url, config) {
  return service.get(url, config);
}

/**
 * POST 方法
 * url 提交地址
 * query 提交參數
 */
export async function post(url, data, config) {
  if (config) {
    return service.post(url, data, config);
  } else {
    return service.post(url, qs.stringify(data));
  }
}
