import type { APIResponse } from '../http';
import { request } from '../http';
import { paramsToSearch } from '../utils';
import { IssueResponse } from './issues/types';
import type {
  CreateScriptResponse,
  MyScoreResponse,
  RealtimeResponse,
  ScoreListResponse,
  ScriptResponse,
  ScriptSetting,
  ScriptSettingResponse,
  ScriptVersionListResponse,
  SearchResponse,
  StatisticsResponse,
  WatchLevelResponse,
} from './types';

export type SortType =
  | 'today_download'
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

export async function search(
  params: SearchParams,
  req?: Request
): Promise<SearchResponse> {
  if (params.uid) {
    const resp = await request<SearchResponse>({
      url: '/user/scripts/' + params.uid + '?' + paramsToSearch(params),
      method: 'GET',
      headers: {
        cookie: req?.headers.get('cookie') || '',
      },
    });
    return resp.data;
  }
  const resp = await request<SearchResponse>({
    url: '/scripts?' + paramsToSearch(params),
    method: 'GET',
    headers: {
      cookie: req?.headers.get('cookie') || '',
    },
  });
  return resp.data;
}

export async function getScript(
  id: number,
  req: Request,
  withCode?: boolean,
) {
  const resp = await request<ScriptResponse>({
    url: '/scripts/' + id + (withCode ? '/code' : ''),
    method: 'GET',
    headers: {
      Cookie: req?.headers.get('Cookie') || '',
    },
  });
  return resp;
}

export async function getScriptByVersion(
  id: number,
  version: string,
  withCode?: boolean
) {
  const resp = await request<ScriptResponse>({
    url: '/scripts/' + id + '/versions/' + version + (withCode ? '/code' : ''),
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
  const resp = await request<ScriptVersionListResponse>({
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

export async function GetMyScore(id: number, req?: Request) {
  const resp = await request<MyScoreResponse>({
    url: '/scripts/' + id + '/score/self',
    method: 'GET',
    headers: {
      cookie: (req && req.headers.get('Cookie')) || '',
    },
  });
  if (resp.status === 404) {
    return null;
  }
  return resp.data.data;
}

export async function GetScriptSetting(id: number, req: Request) {
  const resp = await request<ScriptSettingResponse>({
    url: '/scripts/' + id + '/setting',
    method: 'GET',
    headers: {
      cookie: req.headers.get('Cookie') || '',
    },
  });
  return resp.data;
}

export async function SubmitScore(id: number, message: string, score: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/score',
    method: 'PUT',
    data: {
      message,
      score,
    },
  });
  return resp.data;
}

export type UpdateCodeParams = {
  content: string;
  code: string;
  definition?: string;
  changelog: string;
  public: 1 | 2;
  unwell: 1 | 2;
};

export async function UpdateCode(id: number, params: UpdateCodeParams) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/code',
    method: 'PUT',
    data: params,
  });
  return resp.data;
}

export type CreateScriptParams = {
  name: string;
  description: string;
  definition: string;
  type: 1 | 2 | 3;
} & UpdateCodeParams;

export async function CreateScript(params: CreateScriptParams) {
  const resp = await request<CreateScriptResponse>({
    url: '/scripts',
    method: 'POST',
    data: params,
  });
  return resp.data;
}

// 更新脚本设置
export async function UpdateScript(
  id: number,
  params: {
    name?: string;
    description?: string;
    sync_url?: string;
    content_url?: string;
    definition_url?: string;
    sync_mode?: 1 | 2;
  }
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id,
    method: 'PUT',
    data: params,
  });
  return resp.data;
}

export async function DeleteScript(id: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id,
    method: 'DELETE',
  });
  return resp.data;
}

export async function ArchiveScript(id: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/archive',
    method: 'PUT',
  });
  return resp.data;
}

export async function UnarchiveScript(id: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/archive',
    method: 'DELETE',
  });
  return resp.data;
}

export async function WatchLevel(id: number, req?: Request) {
  const resp = await request<WatchLevelResponse>({
    url: '/scripts/' + id + '/watch',
    method: 'GET',
    headers: {
      cookie: req?.headers.get('Cookie') || '',
    },
  });
  return resp.data;
}

export async function WatchScript(id: number, level: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/watch',
    method: 'POST',
    data: { level },
  });
  return resp.data;
}

export async function UnwatchScript(id: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/watch',
    method: 'DELETE',
  });
  return resp.data;
}

export async function DeleteScore(scriptId: number, id: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/score/' + id,
    method: 'DELETE',
  });
  return resp.data;
}

export async function GetStatistics(scriptId: number, req: Request) {
  const resp = await request<StatisticsResponse>({
    url: '/statistics/script/' + scriptId,
    method: 'GET',
    headers: {
      cookie: req.headers.get('Cookie') || '',
    },
  });
  return resp.data;
}

export async function GetRealtime(scriptId: number) {
  const resp = await request<RealtimeResponse>({
    url: '/statistics/script/' + scriptId + '/realtime',
    method: 'GET',
  });
  return resp.data;
}
