import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { PATHNAME_HEADER } from './lib/pathname-header';

const intlMiddleware = createMiddleware({
  ...routing,
  // 启用自动语言检测
  localeDetection: true,
});

export default function middleware(request: NextRequest) {
  // 服务端 layout 拿不到 pathname，只能靠请求头带下去。next-intl 的中间件内部会
  // `new Headers(request.headers)` 转发请求头，所以在它读取之前塞进去即可。
  request.headers.set(PATHNAME_HEADER, request.nextUrl.pathname);
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(zh-CN|zh-TW|ach-UG|en)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|public|assets|locales|styles|robot.txt|ads.txt|sitemap.xml|manifest.json|\\.well-known).*)',
  ],
};
