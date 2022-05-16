import type { Params } from '../http';
import { request } from '../http';
import { paramsToSearch } from '../utils';
import type { SearchResponse } from './types';

export interface SearchParams extends Params {
  uid?: number;
  sort?: 'today' | 'score' | 'total_download' | 'createtime' | 'updatetime';
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
