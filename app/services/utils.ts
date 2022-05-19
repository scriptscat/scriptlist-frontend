import type { Params } from './http';

export function paramsToSearch(params?: Params) {
  if (!params) return '';
  return Object.keys(params)
    .map((k) => k + '=' + encodeURIComponent(params[k]))
    .join('&');
}

export function replaceSearchParam(
  search: string,
  params: { [key: string]: string }
): string {
  for (const key in params) {
    if (search.indexOf(key + '=') > -1) {
      const regex = new RegExp(key + '=.*?(&|$)');
      search = search.replace(regex, key + '=' + params[key] + '$1');
    } else {
      search += (search ? search + '&' : '') + key + '=' + params[key];
    }
  }
  return search;
}
