import { cookies } from 'next/headers';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import type { ThemeMode } from '@/lib/cookies';
import { THEME_COOKIE_NAME, THEME_MODE_COOKIE_NAME } from '@/lib/cookies';
import { Geist, Geist_Mono } from 'next/font/google';
import NavigationProgress from './NavigationProgress';
import { DayjsLocaleProvider } from './DayjsLocaleProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SWRProvider } from '@/lib/swr-config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { userService } from '@/lib/api';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
      <body
        className={
          'page-gradient-bg text-app-primary min-h-screen theme-transition' +
          ` ${geistSans.variable} ${geistMono.variable} antialiased`
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
