import { PassThrough } from 'stream';
import type { EntryContext } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToPipeableStream } from 'react-dom/server';
import { createInstance } from 'i18next';
import i18next from './i18next.server';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import Backend from 'i18next-fs-backend';
import i18n from './i18n'; // your i18n configuration file
import { resolve } from 'node:path';
import { getLocale } from './utils/i18n';
import isbot from 'isbot';

const ABORT_DELAY = 10 * 1000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const url = new URL(request.url);
  const splitPath = url.pathname.split('/');
  if (splitPath.length > 1) {
    let lng = await i18next.getLocale(request);
    switch (splitPath[1].toLowerCase()) {
      case 'api':
        if (process.env.NODE_ENV === 'development') {
          // 反向代理
          let url = request.url.replace(
            /^.*?\/api\/v2/g,
            process.env.APP_API_PROXY || 'http://localhost:3000/api/v2'
          );
          let proxyUrl = new URL(
            process.env.APP_API_PROXY || 'http://localhost:3000/api/v2'
          );
          let headers = new Headers();
          request.headers.forEach((value, key) => {
            if (key == 'host') {
              headers.set('host', proxyUrl.host);
            } else {
              headers.set(key, request.headers.get(key)!);
            }
          });
          return fetch(url, {
            method: request.method,
            headers: headers,
            body: request.body,
            redirect: request.redirect,
          });
        }
        break;
      case 'u':
      case 's':
        if (splitPath[2].match(/^\d+$/)) {
          const type =
            splitPath[1].toLowerCase() == 'u'
              ? (splitPath[1] = 'users')
              : (splitPath[1] = 'script-show-page');
          return new Response(null, {
            status: 301,
            headers: {
              Location: `/${lng}/${type}/${splitPath[2]}`,
            },
          });
        } else
          throw new Response('Page not found', {
            status: 404,
            statusText: 'Not Found',
          });
      case 'script-show-page':
      case 'users':
      case 'search':
      case 'invite-confirm':
      case 'post-script':
        // 如果是以下面的路径开头的,则获取语言并重定向路径
        let path = `/${lng}${url.pathname}`;
        if (url.search) {
          path += url.search;
        }
        return new Response(null, {
          status: 301,
          headers: {
            Location: path,
          },
        });
    }
  }

  if (url.pathname.match(/\/[us]\/\d+\/?$/)) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: url.pathname.replace(/\/[us]\//, (match) =>
          match === '/u/' ? '/users/' : '/script-show-page/'
        ),
      },
    });
  }
  let callbackName = isbot(request.headers.get('user-agent'))
    ? 'onAllReady'
    : 'onShellReady';
  // let callbackName = 'onAllReady';

  let instance = createInstance();
  let lng = getLocale(request);

  let ns = i18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(Backend) // Setup our backend
    .init({
      ...i18n, // spread the configuration
      lng, // The locale we detected above
      ns, // The namespaces the routes about to render wants to use
      backend: { loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json') },
    });

  return new Promise((resolve, reject) => {
    let didError = false;

    let { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        [callbackName]: () => {
          let body = new PassThrough();

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
