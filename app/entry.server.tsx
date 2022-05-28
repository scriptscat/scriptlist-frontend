import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { parseCookie } from 'utils/cookie';
import { UserContext, UserContextData } from './context-manager';
import { loginUserinfoAndRefushToken } from './services/users/api';
import { Follow, User } from './services/users/types';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const cookieHeader = request.headers.get('Cookie');
  let user: UserContextData = {};
  const respInit: ResponseInit = {};
  if (cookieHeader) {
    const cookie = parseCookie(cookieHeader);
    if (cookie.token) {
      const resp = await loginUserinfoAndRefushToken({ token: cookie.token });
      if (resp.setCookie) {
        respInit.headers = new Headers();
        resp.setCookie.forEach((item) => {
          (respInit.headers as Headers).append('Set-Cookie', item);
        });
      }
      user = {
        user: resp.user.user,
        follow: resp.user.follow,
      };
    }
  }

  let markup = renderToString(
    <UserContext.Provider value={user}>
      <RemixServer context={remixContext} url={request.url} />
    </UserContext.Provider>
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
