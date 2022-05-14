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
