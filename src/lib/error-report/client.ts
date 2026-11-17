import { systemService } from '@/lib/api/services/system';
import { createReporter, isPageTranslated, localeFromPath } from './core';

/**
 * 浏览器端上报入口。模块级单例：去重与条数上限按一次页面加载计。
 */
export const reportClientError = createReporter({
  send: (payload) => {
    // keepalive：用户看到错误页后往往立刻刷新，请求要能活过页面卸载
    void systemService
      .reportClientError(payload, { keepalive: true })
      .catch(() => {});
  },
  getContext: () => ({
    pathname: window.location.pathname,
    search: window.location.search,
    locale: localeFromPath(window.location.pathname),
    build: process.env.NEXT_PUBLIC_BUILD_ID,
    translated: isPageTranslated(document),
  }),
});
