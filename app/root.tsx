import type {
  LinksFunction,
  MetaFunction,
  LoaderFunction,
} from '@remix-run/node';
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
import { parseCookie } from 'utils/cookie';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: antdDark },
  { rel: 'stylesheet', href: antdLight },
];

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'ScriptCat - 分享你的用户脚本',
  description: '脚本猫脚本站,在这里你可以与全世界分享你的用户脚',
  viewport: 'width=device-width,initial-scale=1',
  keyword: 'ScriptCat UserScript 用户脚本',
});

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie');
  let styleMode = '';
  if (cookieHeader) {
    const cookie = parseCookie(cookieHeader);
    styleMode = cookie.styleMode ? cookie.styleMode : '';
  }
  return {
    styleMode: styleMode,
  };
};

export default function App() {
  const config = useLoaderData();
  return (
    <html lang="zh-cn">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <MainLayout styleMode={config.styleMode}>
          <Outlet />
        </MainLayout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
