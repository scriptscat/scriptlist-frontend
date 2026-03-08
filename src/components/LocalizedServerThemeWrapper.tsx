import { cookies } from 'next/headers';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import type { ThemeMode } from '@/lib/cookies';
import { THEME_COOKIE_NAME, THEME_MODE_COOKIE_NAME } from '@/lib/cookies';
import NavigationProgress from './NavigationProgress';
import { DayjsLocaleProvider } from './DayjsLocaleProvider';
import { SWRProvider } from '@/lib/swr-config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { pickMessages } from '@/i18n/pickMessages';
import { userService, systemService } from '@/lib/api';
import type { GlobalConfig } from '@/lib/api/services/system';
import { GlobalConfigProvider } from '@/contexts/GlobalConfigContext';
import GoogleAdScript from './GoogleAd/script';
import Script from 'next/script';

// 服务端 cookie 读取函数
export async function getThemeFromServerCookies(): Promise<ThemeMode> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME);
  const ret: ThemeMode = {
    mode: 'auto',
    theme: 'light',
  };
  if (!themeCookie) {
    return ret;
  }
  ret.theme = themeCookie.value === 'dark' ? 'dark' : 'light';
  const themeModeCookie = cookieStore.get(THEME_MODE_COOKIE_NAME);
  if (themeModeCookie) {
    ret.mode = themeModeCookie.value as 'light' | 'dark' | 'auto';
  }
  return ret;
}

interface LocalizedServerThemeWrapperProps {
  children: React.ReactNode;
  locale: string;
}

export async function LocalizedServerThemeWrapper({
  children,
  locale,
}: LocalizedServerThemeWrapperProps) {
  // 并行获取服务端主题、国际化消息、用户信息和全局配置
  const [serverTheme, messages, user, globalConfig] = await Promise.all([
    getThemeFromServerCookies(),
    getMessages(),
    userService.getCurrentUser(),
    systemService.getGlobalConfig().catch((): GlobalConfig => ({ turnstile_site_key: '', qq_migrate_enabled: false })),
  ]);

  return (
    <html lang={locale} data-theme={serverTheme.theme} suppressHydrationWarning>
      <head>
        <meta
          name="theme-color"
          content={serverTheme.theme === 'dark' ? '#0d1117' : '#f6f8fa'}
        />
        {serverTheme.theme === 'dark' && (
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        )}
        <GoogleAdScript />

        {serverTheme.mode === 'auto' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var d=document.documentElement;var m=window.matchMedia('(prefers-color-scheme:dark)');if(m.matches){d.setAttribute('data-theme','dark')}else{d.setAttribute('data-theme','light')}}catch(e){}})()`,
            }}
          />
        )}
      </head>
      <body
        className={
          'page-gradient-bg text-app-primary min-h-screen theme-transition'
        }
      >
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-N2X6MNVRL3"
        />
        <Script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-N2X6MNVRL3');`,
          }}
        />
        <NavigationProgress />
        <ThemeProvider initialMode={serverTheme}>
          <SWRProvider>
            <NextIntlClientProvider
              messages={pickMessages(messages, [
                'layout',
                'common',
                'components',
                'error',
                'utils',
              ])}
            >
              <DayjsLocaleProvider>
                <GlobalConfigProvider config={globalConfig}>
                  <UserProvider user={user}>{children}</UserProvider>
                </GlobalConfigProvider>
              </DayjsLocaleProvider>
            </NextIntlClientProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
