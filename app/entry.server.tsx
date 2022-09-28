import { createRequestHandler, EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';

export default function handleRequest(
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
        /^.*?\/api\/v1/g,
        process.env.APP_API_PROXY || 'http://localhost:3000/api/v1'
      );
      let proxyUrl = new URL(
        process.env.APP_API_PROXY || 'http://localhost:3000/api/v1'
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
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
