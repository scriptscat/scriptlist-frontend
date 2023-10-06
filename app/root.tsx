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
  useLoaderData,
} from '@remix-run/react';
import MainLayout from '~/components/layout/MainLayout';
import styles from './styles/app.css';
import antdLight from './styles/light.css';
import antdDark from './styles/dark.css';
import { parseCookie } from '~/utils/cookie';
import { getCurrentUserAndRefushToken } from './services/users/api';
import type { User } from './services/users/types';
import { UserContext } from './context-manager';
import tuiEditor from '@toast-ui/editor/dist/toastui-editor.css';
import tuiEditorDark from '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { useState } from 'react';
import { InitAxios } from './services/http';
import prism from 'prismjs/themes/prism.css';
import GoogleAdScript from './components/GoogleAd/script';
import { useChangeLanguage } from 'remix-i18next';
import { useTranslation } from 'react-i18next';
import i18next from '~/i18next.server';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: antdDark },
  { rel: 'stylesheet', href: antdLight },
  { rel: 'stylesheet', href: tuiEditor },
  { rel: 'stylesheet', href: tuiEditorDark },
  { rel: 'stylesheet', href: prism },
];

export const meta: V2_MetaFunction = ({ data }) => {
  return [
    { charset: 'utf-8' },
    { title: 'ScriptCat - 分享你的用户脚本' },
    { description: '脚本猫脚本站,在这里你可以与全世界分享你的用户脚本' },
    { keywords: 'ScriptCat,UserScript,用户脚本,脚本猫,油猴,油猴脚本' },
  ];
};

export const unstable_shouldReload = () => false;

export const loader: LoaderFunction = async ({ request }) => {
  let locale = await i18next.getLocale(request);
  const cookieHeader = request.headers.get('Cookie');
  let user: User | undefined;
  const respInit: ResponseInit = {};
  let styleMode = '';
  if (cookieHeader) {
    const cookie = parseCookie(cookieHeader);
    styleMode = cookie.styleMode ? cookie.styleMode : '';
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
      ENV: {
        NODE_ENV: process.env.NODE_ENV,
        APP_API_URL: process.env.APP_API_URL,
        APP_BBS_OAUTH_CLIENT: process.env.APP_BBS_OAUTH_CLIENT,
      },
      login: {
        user: user,
      },
      locale,
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

export default function App() {
  const config = useLoaderData();
  const [dart, setDart] = useState(false);
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
  let { locale } = useLoaderData<typeof loader>();

  let { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);

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
      <body>
        <UserContext.Provider
          value={{
            user: config.login.user,
            dark: dart,
            env: config.ENV,
          }}
        >
          <MainLayout
            styleMode={config.styleMode}
            oauthClient={config.ENV.APP_BBS_OAUTH_CLIENT}
            apiUrl={config.ENV.APP_API_URL}
            onDarkModeChange={(dart) => setDart(dart)}
          >
            <Outlet />
          </MainLayout>
        </UserContext.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
