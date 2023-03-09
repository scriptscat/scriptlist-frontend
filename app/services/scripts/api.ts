import type { GrayControlValue } from '~/components/GrayControl';
import type { APIResponse } from '../http';
import { request } from '../http';
import { paramsToSearch } from '../utils';
import type {
  AdvRealtimeChartResponse,
  AdvStatisticsResponse,
  CreateScriptResponse,
  MyScoreResponse,
  OriginListResponse,
  RealtimeResponse,
  ScoreListResponse,
  ScriptResponse,
  ScriptSettingResponse,
  ScriptStateResponse,
  ScriptVersionListResponse,
  SearchResponse,
  StatisticsResponse,
  UpdateWhitelistResponse,
  VisitDomainResponse,
  VisitListResponse,
} from './types';

export type SortType =
  | 'today_download'
  | 'score'
  | 'total_download'
  | 'createtime'
  | 'updatetime';

export type ScriptType = '' | '1' | '2' | '3' | '4';

export type SearchParams = {
  user_id?: number;
  sort?: SortType;
  page?: number;
  size?: number;
  category?: string;
  script_type?: ScriptType;
  domain?: string;
  keyword?: string;
};

export async function search(
  params: SearchParams,
  req?: Request
): Promise<SearchResponse> {
  if (params.user_id) {
    const resp = await request<SearchResponse>({
      url: '/users/' + params.user_id + '/scripts?' + paramsToSearch(params),
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

export async function lastScoreScript() {
  const resp = await request<SearchResponse>({
    url: '/scripts/last-score',
    method: 'GET',
  });
  return resp.data;
}

export async function getScript(id: number, req: Request, withCode?: boolean) {
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
  size?: number;
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
  size?: number;
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
  is_pre_release: 0 | 1 | 2;
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
  version: string;
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
export async function UpdateScriptSetting(
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
    url: '/scripts/' + id + '/setting',
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

export async function ArchiveScript(id: number, archive: boolean) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/archive',
    method: 'PUT',
    data: { archive },
  });
  return resp.data;
}

export async function ScriptState(id: number, req?: Request) {
  const resp = await request<ScriptStateResponse>({
    url: '/scripts/' + id + '/state',
    method: 'GET',
    headers: {
      cookie: req?.headers.get('Cookie') || '',
    },
  });
  return resp.data;
}

export async function WatchScript(id: number, watch: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/watch',
    method: 'POST',
    data: { watch },
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
    url: '/script/' + scriptId + '/statistics',
    method: 'GET',
    headers: {
      cookie: req.headers.get('Cookie') || '',
    },
  });
  return resp.data;
}

export async function GetRealtime(scriptId: number) {
  const resp = await request<RealtimeResponse>({
    url: '/script/' + scriptId + '/statistics/realtime',
    method: 'GET',
  });
  return resp.data;
}

export async function UpdateCodeSetting(
  scriptId: number,
  codeId: number,
  changelog: string,
  is_pre_release: number
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/code/' + codeId,
    method: 'PUT',
    data: { changelog, is_pre_release },
  });
  return resp.data;
}

export async function UpdateScriptPublic(scriptId: number, public_: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/public',
    method: 'PUT',
    data: { public: public_ },
  });
  return resp.data;
}

export async function UpdateScriptUnwell(scriptId: number, unwell: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/unwell',
    method: 'PUT',
    data: { unwell },
  });
  return resp.data;
}

export async function UpdateScriptGrayControls(
  scriptId: number,
  enablePreRelease: number,
  grayControls: GrayControlValue[]
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/gray',
    method: 'PUT',
    data: { enable_pre_release: enablePreRelease, gray_controls: grayControls },
  });
  return resp.data;
}

export async function ScriptCodeDelete(scriptId: number, codeId: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/code/' + codeId,
    method: 'DELETE',
  });
  return resp.data;
}

// 高级统计
export async function GetAdvStatistics(scriptId: number, req: Request) {
  const resp = await request<AdvStatisticsResponse>({
    url: '/statistics/' + scriptId + '/advanced',
    method: 'GET',
    headers: {
      cookie: req.headers.get('Cookie') || '',
    },
  });
  return resp.data;
}

export async function GetAdvRealtimeChart(scriptId: number) {
  const resp = await request<AdvRealtimeChartResponse>({
    url: '/statistics/' + scriptId + '/realtime/chart',
    method: 'GET',
  });
  return resp.data;
}

export async function GetOriginList(scriptId: number, page: number) {
  const resp = await request<OriginListResponse>({
    url: '/statistics/' + scriptId + '/user-origin?page=' + page,
    method: 'GET',
  });
  return resp.data;
}

export async function GetVisitDomain(scriptId: number, page: number) {
  const resp = await request<VisitDomainResponse>({
    url: '/statistics/' + scriptId + '/visit-domain?page=' + page,
    method: 'GET',
  });
  return resp.data;
}

export async function GetVisitList(scriptId: number, page: number) {
  const resp = await request<VisitListResponse>({
    url: '/statistics/' + scriptId + '/visit?page=' + page,
    method: 'GET',
  });
  return resp.data;
}

export async function UpdateWhitelist(scriptId: number, whitelist: string[]) {
  const resp = await request<UpdateWhitelistResponse>({
    url: '/statistics/' + scriptId + '/whitelist',
    method: 'PUT',
    data: { whitelist },
  });
  return resp.data;
}
