import { json, redirect } from '@remix-run/node';
import i18next from '~/i18next.server';

export async function i18nRedirect({ request }: { request: Request }) {
  // 在路径前面加上语言前缀,然后重定向
  let locale = await i18next.getLocale(request);
  if (!locale) {
    return new Response('Not Found', { status: 404 });
  }
  return redirect('/' + locale + new URL(request.url).pathname, 301);
}

const lngMap: {
  [key: string]: { [key: string]: { name: string; value: string } };
} = {
  en: { en: { name: 'English', value: 'en' } },
  zh: {
    'zh-CN': { name: '简体中文', value: 'zh-CN' },
    'zh-TW': { name: '繁體中文', value: 'zh-TW' },
  },
};

// 根据路径获取语言
export function getLocale(request: Request) {
  let split = new URL(request.url).pathname.split('/');
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
    if (lngMap[lng] && lngMap[lng][locale]) {
      return lngMap[lng][locale].value;
    }
  }
  return '';
}
