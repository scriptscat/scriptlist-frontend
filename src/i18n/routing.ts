import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'zh-CN', 'zh-TW', 'ach-UG'],

  // Used when no locale matches
  defaultLocale: 'en',
  
  // 启用路径前缀策略，确保所有路由都有语言前缀
  localePrefix: 'always',
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
