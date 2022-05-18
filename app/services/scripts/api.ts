import type { Params } from '../http';
import { request } from '../http';
import { paramsToSearch } from '../utils';
import type { ScriptResponse, SearchResponse } from './types';

export type SortType =
  | 'today'
  | 'score'
  | 'total_download'
  | 'createtime'
  | 'updatetime';

export interface SearchParams extends Params {
  uid?: number;
  sort?: SortType;
  page?: number;
  count?: number;
  category?: string;
  domain?: string;
  keyword?: string;
}

export async function search(params: SearchParams) {
  const resp = await request<SearchResponse>({
    url: '/scripts?' + paramsToSearch(params),
    method: 'GET',
  });
  return resp.data;
}

export async function getScript(id: number, withCode?: boolean) {
  const resp = await request<ScriptResponse>({
    url: '/scripts/' + id + (withCode ? '/code' : ''),
    method: 'GET',
  });
  if (resp.status === 404) {
    return null;
  }
  return resp.data.data;
}
