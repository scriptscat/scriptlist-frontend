import type { Instrumentation } from 'next';
import { reportServerError } from '@/lib/error-report/server';

// 服务端渲染出错时把请求路径一并上报：Next 自己打的错误日志不带 URL，
// 多个访客同时出错时对不上是谁。
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
) => {
  // 不 await：上报不能拖慢或改变原请求的响应（reportServerError 自己吞掉所有失败）
  void reportServerError(error, request);
};
