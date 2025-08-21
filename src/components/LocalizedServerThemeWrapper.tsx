/* eslint-disable @next/next/next-script-for-ga */
import { cookies } from 'next/headers';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import type { ThemeMode } from '@/lib/cookies';
import { THEME_COOKIE_NAME, THEME_MODE_COOKIE_NAME } from '@/lib/cookies';
import NavigationProgress from './NavigationProgress';
import { DayjsLocaleProvider } from './DayjsLocaleProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SWRProvider } from '@/lib/swr-config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { userService } from '@/lib/api';
import Head from 'next/head';
import GoogleAdScript from './GoogleAd/script';

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
  // 获取服务端主题
  const serverTheme = await getThemeFromServerCookies();
  const messages = await getMessages();
  const user = await userService.getCurrentUser();

  return (
    <html lang={locale} data-theme={serverTheme.theme}>
      <Head>
        <meta
          name="theme-color"
          content={serverTheme.theme === 'dark' ? '#0d1117' : '#f6f8fa'}
        />
        {serverTheme.theme === 'dark' && (
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        )}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-N2X6MNVRL3"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-N2X6MNVRL3');`,
          }}
        />
        <GoogleAdScript />
      </Head>
      <body
        className={
          'page-gradient-bg text-app-primary min-h-screen theme-transition'
        }
      >
        <NavigationProgress />
        <ThemeProvider initialMode={serverTheme}>
          <AntdRegistry>
            <SWRProvider>
              <NextIntlClientProvider messages={messages}>
                <DayjsLocaleProvider>
                  <UserProvider user={user}>{children}</UserProvider>
                </DayjsLocaleProvider>
              </NextIntlClientProvider>
            </SWRProvider>
          </AntdRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
