import type { Params } from './http';

export function paramsToSearch(params: Params) {
  return Object.keys(params)
    .map((k) => k + '=' + encodeURIComponent(params[k]))
    .join('&');
}
