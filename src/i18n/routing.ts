import { defineRouting } from 'next-intl/routing';
import { useRouter as useToploaderRouter } from 'nextjs-toploader/app';
import { createNavigation } from 'next-intl/navigation';
import { useLocale } from 'next-intl';

export const languageMap: {
  [key: string]: {
    label: string;
    locale: string;
  };
} = {
  en: {
    label: 'English',
    locale: 'en-US',
  },
  'zh-CN': {
    label: '简体中文',
    locale: 'zh-CN',
  },
  'zh-TW': {
    label: '繁體中文',
    locale: 'zh-TW',
  },
  ru: {
    label: 'Русский',
    locale: 'ru-RU',
  },
  ja: {
    label: '日本語',
    locale: 'ja-JP',
  },
  de: {
    label: 'Deutsch',
    locale: 'de-DE',
  },
  // {
  //   key: 'ach-UG',
  //   label: 'Acholi',
  // },
};

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: Object.keys(languageMap),

  // Used when no locale matches
  defaultLocale: 'en',

  // 启用路径前缀策略，确保所有路由都有语言前缀
  localePrefix: 'always',
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {
  Link,
  redirect,
  usePathname,
  getPathname,
  useRouter: useI18nRouter,
} = createNavigation(routing);

// 结合 nextjs-toploader/app 的 useRouter
export function useRouter() {
  const locale = useLocale();
  const toploaderRouter = useToploaderRouter();

  return {
    push: (href: string, options?: any) => {
      const pushHref = getPathname({
        href: href,
        locale,
      });
      toploaderRouter.push(pushHref, options);
    },
    back: () => {
      toploaderRouter.back();
    },
    refresh: () => {
      toploaderRouter.refresh();
    },
    locale,
  };
}
