import { PassThrough } from 'stream';
import type { EntryContext } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { createInstance } from 'i18next';
import i18next from './i18next.server';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import Backend from 'i18next-fs-backend';
import i18n from './i18n'; // your i18n configuration file
import { resolve } from 'node:path';
import { getLocale } from './utils/utils';

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
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
  }

  // let callbackName = isbot(request.headers.get('user-agent'))
  //   ? 'onAllReady'
  //   : 'onShellReady';
  let callbackName = 'onAllReady';

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
