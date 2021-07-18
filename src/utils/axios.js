import axios from "axios";
import qs from "qs";

 const baseURL =
   process.env.NODE_ENV === "production"
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
export async function get(url, query) {
  return service.get(url, query);
}

/**
 * POST 方法
 * url 提交地址
 * query 提交參數
 */
export async function post(url, query, config) {
  if (config) {
    return service.post(url,query, config);
  } else {
    return service.post(url, qs.stringify(query));
  }
}
