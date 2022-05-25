import { request } from '../http';
import { paramsToSearch } from '../utils';
import type {
  MyScoreResponse,
  ScoreListResponse,
  ScriptListResponse,
  ScriptResponse,
  SearchResponse,
} from './types';

export type SortType =
  | 'today'
  | 'score'
  | 'total_download'
  | 'createtime'
  | 'updatetime';

export type SearchParams = {
  uid?: number;
  sort?: SortType;
  page?: number;
  count?: number;
  category?: string;
  domain?: string;
  keyword?: string;
};

export async function search(params: SearchParams) {
  if (params.uid) {
    const resp = await request<SearchResponse>({
      url: '/user/scripts/' + params.uid + '?' + paramsToSearch(params),
      method: 'GET',
    });
    return resp.data;
  }
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

export type ScriptVersionListParams = {
  page?: number;
  count?: number;
};

export async function ScriptVersionList(
  id: number,
  params?: ScriptVersionListParams
) {
  const resp = await request<ScriptListResponse>({
    url: '/scripts/' + id + '/versions?' + paramsToSearch(params),
    method: 'GET',
  });
  return resp.data;
}

export type ScoreListParam = {
  page?: number;
  count?: number;
};

export async function ScoreList(id: number, params?: ScoreListParam) {
  const resp = await request<ScoreListResponse>({
    url: '/scripts/' + id + '/score?' + paramsToSearch(params),
  });
  return resp.data;
}

export async function GetMyScore(id: number) {
  const resp = await request<MyScoreResponse>({
    url: '/scripts/' + id + '/score/self',
    method: 'GET',
  });
  if (resp.status === 404) {
    return null;
  }
  return resp.data.data;
}

export async function GetScriptSetting(id: number, token: string) {
  const resp = await request<ScriptResponse>({
    url: '/scripts/' + id + '/setting',
    method: 'GET',
    headers: {
      cookie: 'token=' + token,
    },
  });
  return resp.data.data;
}
