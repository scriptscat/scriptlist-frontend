import { AxiosResponse, AxiosResponseHeaders } from 'axios';

export function parseCookie(cookieHeader: string) {
  if (!cookieHeader) return {};
  return cookieHeader
    .split(';')
    .reduce((cookies: { [key: string]: string }, cookie) => {
      const [key, value] = cookie.split('=');
      cookies[key.trim()] = value;
      return cookies;
    }, {});
}

export function getToken(request: Request) {
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookie = parseCookie(cookieHeader);
    return cookie.token;
  }
  return undefined;
}

export function forwardHeaders(resp: AxiosResponse): Headers {
  let headers = new Headers();
  if (resp.headers['set-cookie']) {
    resp.headers['set-cookie'].forEach((val) => {
      headers.append('set-cookie', val);
    });
  }
  return headers;
}
