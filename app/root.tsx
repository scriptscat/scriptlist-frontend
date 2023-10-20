import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import MainLayout from '~/components/layout/MainLayout';
import styles from './styles/app.css';
import { parseCookie } from '~/utils/cookie';
import { getCurrentUserAndRefushToken } from './services/users/api';
import type { User } from './services/users/types';
import { UserContext } from './context-manager';
import { useContext, useEffect, useState } from 'react';
import { InitAxios } from './services/http';
import GoogleAdScript from './components/GoogleAd/script';
import { useChangeLanguage } from 'remix-i18next';
import { I18nContext, useTranslation } from 'react-i18next';
import { getLocale, getLocaleByURL } from './utils/i18n';
import NavigationProcess from './components/NavigationProcess/NavigationProcess';
import i18next from './i18next.server';
import { ConfigProvider, theme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: '/styles/antd.min.css' },
];

export const meta: V2_MetaFunction = ({ data }) => {
  return [
    { charset: 'utf-8' },
    { title: 'ScriptCat - ' + data.share_your_userscript },
    {
      description: data.home_page_description,
    },
    {
      keywords:
        'ScriptCat,UserScript,Tampermonkey,Greasemonkey,Violentmonkey,用户脚本,脚本猫,油猴,油猴脚本',
    },
  ];
};

export const unstable_shouldReload = () => false;

export const loader: LoaderFunction = async ({ request }) => {
  // 根据路径设置语言
  let locale = getLocale(request);
  if (!locale) {
    locale = await i18next.getLocale(request);
  }
  let t = await i18next.getFixedT(locale || 'en');
  const cookieHeader = request.headers.get('Cookie');
  let user: User | undefined;
  const respInit: ResponseInit = {};
  let styleMode = '';
  let darkMode = '';
  if (cookieHeader) {
    const cookie = parseCookie(cookieHeader);
    styleMode = cookie.styleMode ? cookie.styleMode : '';
    darkMode = cookie.darkMode ? cookie.darkMode : 'auto';
    if (cookie.token) {
      const resp = await getCurrentUserAndRefushToken(request);
      if (resp.setCookie) {
        respInit.headers = new Headers();
        resp.setCookie.forEach((item) => {
          (respInit.headers as Headers).append('Set-Cookie', item);
        });
      }
      user = resp.user;
    }
  }
  return json(
    {
      styleMode: styleMode,
      darkMode: darkMode,
      ENV: {
        NODE_ENV: process.env.NODE_ENV,
        APP_API_URL: process.env.APP_API_URL,
        APP_BBS_OAUTH_CLIENT: process.env.APP_BBS_OAUTH_CLIENT,
        APP_ENV: process.env.APP_ENV,
      },
      login: {
        user: user,
      },
      locale: locale,
      share_your_userscript: t('share_your_userscript'),
      home_page_description: t('home_page_description'),
    },
    respInit
  );
};

export let handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: 'common',
};

export function CatchBoundary() {
  const error = useRouteError();
  const [config, setConfig] = useState<any>();
  const [dark, setDart] = useState(false);
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [locale, setLocale] = useState('en');
  const i18n = useContext(I18nContext);

  useEffect(() => {
    fetch('/' + getLocaleByURL(location.href) + '/?_data=root').then((resp) => {
      resp.json().then((data) => {
        setConfig(data);
        setDart(data.styleMode === 'dark');
        setDarkMode(data.darkMode);
        setLocale(data.locale);
        i18n.i18n.changeLanguage(data.locale);
        dayjs.locale(locale.toLocaleLowerCase());
        dayjs.extend(relativeTime);
      });
    });
  }, []);

  // Get the locale from the loader

  let tr = useTranslation();

  let data = 'Unknown Error';
  let subtitle = '';
  let title = 'Oh no!';
  if (isRouteErrorResponse(error)) {
    data = error.statusText;
    title = error.statusText;
    subtitle = error.data;
  } else if (error instanceof Error) {
    data = error.message;
  }

  return (
    <html lang={locale} dir={tr.i18n.dir()}>
      <head>
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body
        className={dark ? 'dark' : 'light'}
        style={{
          background: dark ? '#000' : '#fff',
        }}
      >
        <StyleProvider hashPriority="high">
          <UserContext.Provider
            value={{
              user: config && config.login.user,
              dark: dark,
              darkMode: darkMode,
              env: config && config.ENV,
            }}
          >
            <MainLayout
              locale={locale}
              oauthClient={config && config.ENV.APP_BBS_OAUTH_CLIENT}
              apiUrl={config && config.ENV.APP_API_URL}
              onStyleModeChang={(dark: boolean) => {
                setDart(dark);
              }}
              onDarkModeChange={(mode) => {
                setDarkMode(mode as any);
              }}
            >
              <div className="text-2xl">{data}</div>
              {subtitle && <div className="text-xl">{subtitle}</div>}
            </MainLayout>
          </UserContext.Provider>
        </StyleProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  const config = useLoaderData();
  const [dark, setDark] = useState(config.styleMode === 'dark');
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'auto'>(
    config.darkMode || 'auto'
  );
  // 设置axios
  InitAxios({
    baseURL:
      typeof window == 'undefined'
        ? process.env.APP_API_PROXY
        : config.ENV.NODE_ENV == 'development'
        ? '/api/v2'
        : config.ENV.APP_API_URL,
    timeout: 10000,
    validateStatus: (status: number) => status < 500,
  });

  // Get the locale from the loader
  let { locale } = config;

  let { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);

  dayjs.locale(locale.toLocaleLowerCase());
  dayjs.extend(relativeTime);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
        <GoogleAdScript />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-N2X6MNVRL3"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-N2X6MNVRL3');`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?9a2c8c9a94f471c29e7bb97a363d204f";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s);
          })();`,
          }}
        />
      </head>
      <body
        className={dark ? 'dark' : 'light'}
        style={{
          background: dark ? '#000' : '#fff',
        }}
      >
        <StyleProvider hashPriority="high">
          <ConfigProvider
            theme={{
              algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            }}
          >
            <UserContext.Provider
              value={{
                user: config.login.user,
                dark: dark,
                darkMode: darkMode,
                env: config.ENV,
              }}
            >
              <NavigationProcess />
              <MainLayout
                locale={locale}
                oauthClient={config.ENV.APP_BBS_OAUTH_CLIENT}
                apiUrl={config.ENV.APP_API_URL}
                onStyleModeChang={(dark) => setDark(dark)}
                onDarkModeChange={(mode) => setDarkMode(mode as any)}
              >
                <Outlet />
              </MainLayout>
            </UserContext.Provider>
          </ConfigProvider>
        </StyleProvider>
        {locale == 'ach-UG' && (
          <>
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html:
                  "window._jipt = []; _jipt.push(['project', 'scriptcat']);",
              }}
            ></script>
            <script
              type="text/javascript"
              src="//cdn.crowdin.com/jipt/jipt.js"
            ></script>
          </>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
