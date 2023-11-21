import { json, redirect } from '@remix-run/node';
import i18next from '~/i18next.server';

export async function i18nRedirect({ request }: { request: Request }) {
  // 在路径前面加上语言前缀,然后重定向
  let locale = await i18next.getLocale(request);
  if (!locale) {
    return new Response('Not Found', { status: 404 });
  }
  const url = new URL(request.url);
  let path = `/${locale}${url.pathname}`;
  if (url.search) {
    path += url.search;
  }
  return redirect(path, 301);
}

export const lngMap: {
  [key: string]: {
    [key: string]: { name: string; value: string; hide?: boolean };
  };
} = {
  en: { en: { name: 'English', value: 'en' } },
  zh: {
    'zh-CN': { name: '简体中文', value: 'zh-CN' },
    'zh-TW': { name: '繁體中文', value: 'zh-TW' },
  },
  ach: {
    'ach-UG': { name: '伪语言', value: 'ach-UG', hide: true },
  },
};

// 根据路径获取语言
export function getLocale(request: Request, defaultLocale?: string) {
  return getLocaleByURL(request.url) || defaultLocale;
}

export function getLocaleByURL(url: string) {
  let split = new URL(url).pathname.split('/');
  if (split.length < 1) {
    return 'en';
  }
  let locale = split[1];
  split = locale.split('-');
  let lng = split[0];
  if (split.length === 1) {
    if (lngMap[lng] && lngMap[lng][locale]) {
      return lngMap[lng][locale].value;
    }
  } else if (split.length === 2) {
    locale = split[0] + '-' + split[1].toUpperCase();
    if (lngMap[lng] && lngMap[lng][locale]) {
      return lngMap[lng][locale].value;
    }
  }
  return '';
}

export function getLocaleName(locale: string) {
  let split = locale.split('-');
  let lng = split[0];
  if (split.length === 1) {
    if (lngMap[lng] && lngMap[lng][locale]) {
      return lngMap[lng][locale].name;
    }
  } else if (split.length === 2) {
    if (lngMap[lng] && lngMap[lng][locale]) {
      return lngMap[lng][locale].name;
    }
  }
  return '';
}
