import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
  ...routing,
  // 启用自动语言检测
  localeDetection: true,
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(zh-CN|zh-TW|ach-UG|en)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|public|assets|locales|styles).*)',
  ],
};
