import type {
  LinksFunction,
  MetaFunction,
  LoaderFunction,
} from '@remix-run/node';
import { json } from '@remix-run/node';
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
import { loginUserinfoAndRefushToken } from './services/users/api';
import type { Follow, User } from './services/users/types';
import { UserContext } from './context-manager';
import tuiEditor from '@toast-ui/editor/dist/toastui-editor.css';
import tuiEditorDark from '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { useState } from 'react';
import { InitAxios } from './services/http';
import prism from 'prismjs/themes/prism.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: antdDark },
  { rel: 'stylesheet', href: antdLight },
  { rel: 'stylesheet', href: tuiEditor },
  { rel: 'stylesheet', href: tuiEditorDark },
  { rel: 'stylesheet', href: prism },
];

export const meta: MetaFunction = ({ data }) => {
  return {
    charset: 'utf-8',
    title: 'ScriptCat - 分享你的用户脚本',
    description: '脚本猫脚本站,在这里你可以与全世界分享你的用户脚',
    keyword: 'ScriptCat UserScript 用户脚本',
  };
};

export const unstable_shouldReload = () => false;

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie');
  let user: { follow: Follow; user: User } | undefined;
  const respInit: ResponseInit = {};
  let styleMode = '';
  if (cookieHeader) {
    const cookie = parseCookie(cookieHeader);
    styleMode = cookie.styleMode ? cookie.styleMode : '';
    if (cookie.token) {
      const resp = await loginUserinfoAndRefushToken({ token: cookie.token });
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
        user: user?.user,
        follow: user?.follow,
      },
    },
    respInit
  );
};

export default function App() {
  const config = useLoaderData();
  const [dart, setDart] = useState(false);
  InitAxios({
    baseURL:
      typeof window == 'undefined'
        ? process.env.APP_API_URL
        : config.ENV.NODE_ENV == 'development'
        ? '/api/v1'
        : config.ENV.APP_API_URL,
    timeout: 10000,
    validateStatus: (status: number) => status < 500,
  });
  return (
    <html lang="zh-cn">
      <head>
        <Meta />
        <Links />
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
            follow: config.login.follow,
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
