import type { GrayControlValue } from '~/components/GrayControl';
import type { APIDataResponse, APIListResponse, APIResponse } from '../http';
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
  ScriptGroup,
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
  withCode?: boolean,
  req?: Request
) {
  const resp = await request<ScriptResponse>({
    url: '/scripts/' + id + '/versions/' + version + (withCode ? '/code' : ''),
    method: 'GET',
    headers: {
      Cookie: (req && req.headers.get('Cookie')) || '',
    },
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
  params?: ScriptVersionListParams,
  req?: Request
) {
  const resp = await request<ScriptVersionListResponse>({
    url: '/scripts/' + id + '/versions?' + paramsToSearch(params),
    method: 'GET',
    headers: {
      Cookie: (req && req.headers.get('Cookie')) || '',
    },
  });
  return resp.data;
}

export type ScoreListParam = {
  page?: number;
  size?: number;
};

export async function ScoreList(
  id: number,
  params?: ScoreListParam,
  req?: Request
) {
  const resp = await request<ScoreListResponse>({
    url: '/scripts/' + id + '/score?' + paramsToSearch(params),
    headers: {
      Cookie: (req && req.headers.get('Cookie')) || '',
    },
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

export interface GroupItem {
  list: Array<{
    id: number;
    name: string;
  }>;
}
export interface GroupMember {
  avatar: string;
  createtime: number;
  expiretime: number;
  id: number;
  invite_status: number;
  is_expire: boolean;
  user_id: number;
  username: string;
}
export interface UserItem {
  users: Array<{
    user_id: number;
    username: string;
  }>;
}

export async function GetGroupList(id: number, query: string) {
  const resp = await request<APIDataResponse<GroupItem>>({
    url: '/scripts/' + id + '/group?query=' + query + '&size=5',
    method: 'GET',
  });
  return resp.data;
}
export async function GetGroupMemberList(
  id: number,
  gid: number,
  page: number
) {
  const resp = await request<APIListResponse<GroupMember>>({
    url: `/scripts/${id}/group/${gid}/member?page=${page}`,
    method: 'GET',
  });
  return resp.data;
}
export async function GetUserList(query: string) {
  const resp = await request<APIDataResponse<UserItem>>({
    url: '/users/search?query=' + query,
    method: 'GET',
  });
  return resp.data;
}
export async function CreateGroup(
  id: number,
  option: {
    name: string;
    description: string;
  }
) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/group`,
    method: 'POST',
    data: option,
  });
  return resp.data;
}
export interface GroupAndUserLIst {
  label: string;
  value: string | number;
}
export async function GetGroupAndUserList(
  id: number,
  query: string,
  filterGroup: boolean = false
): Promise<GroupAndUserLIst[]> {
  //APIDataResponse<GroupItem>
  const promiseList = await Promise.all([
    filterGroup ? Promise.resolve(undefined) : GetGroupList(id, query),
    GetUserList(query),
  ]);
  let userList: UserItem['users'] | Array<GroupAndUserLIst> =
    promiseList[1]?.data?.users ?? [];

  userList = userList.map((item) => {
    return {
      label: item.username,
      value: 'user-' + item.user_id,
    };
  });
  let groupList: GroupItem['list'] | Array<GroupAndUserLIst> = [];
  groupList = promiseList[0]?.data?.list ?? [];
  groupList = groupList.map((item) => {
    return {
      label: item.name,
      value: 'group-' + item.id,
    };
  });
  return [...groupList, ...userList];
}

export async function GetInviteList(id: number, page: number, gid?: number) {
  const resp = await request<
    APIDataResponse<{
      list: Array<any>;
      total: number;
    }>
  >({
    url:
      gid === undefined
        ? `/scripts/${id}/invite/code?page=${page}`
        : `/scripts/${id}/invite/group/${gid}/code?page=${page}`,
    method: 'GET',
  });
  return resp.data;
}

export async function GetAccessRoleList(id: number, page: number = 1) {
  const resp = await request<
    APIDataResponse<{
      list: Array<any>;
      total: number;
    }>
  >({
    url: '/scripts/' + id + '/access?page=' + page,
    method: 'GET',
  });
  return resp.data;
}
export async function DeleteAccess(id: number, aid: number) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/access/${aid}`,
    method: 'DELETE',
  });
  return resp.data;
}
export async function DeleteGroupUser(id: number, gid: number, mid: number) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/group/${gid}/member/${mid}`,
    method: 'DELETE',
  });
  return resp.data;
}
export async function DeleteInvite(id: number, code_id: number | string) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/invite/code/${code_id}`,
    method: 'DELETE',
  });
  return resp.data;
}
export async function HandleInvite(code: string, accept: boolean) {
  const resp = await request<APIResponse>({
    url: `/scripts/invite/${code}/accept`,
    method: 'PUT',
    data: {
      accept: accept,
    },
  });
  return resp.data;
}
export async function AllowInviteCode(
  id: string | number,
  code_id: string,
  status: 1 | 2
) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/invite/code/${code_id}/audit`,
    method: 'PUT',
    data: {
      status: status,
    },
  });
  return resp.data;
}
export async function UpdateAccessRole(
  id: number,
  aid: string,
  option: {
    expiretime: number;
    role: 'visitor' | 'admin';
  }
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/access/' + aid,
    method: 'PUT',
    data: {
      expiretime: option.expiretime,
      role: option.role,
    },
  });
  return resp.data;
}
export async function CreateInviteCode(
  id: number,
  gid: number | undefined,
  option: {
    audit: boolean;
    count: string;
    days: number;
  }
) {
  const resp = await request<APIDataResponse<{ code: Array<string> }>>({
    url:
      gid === undefined
        ? `/scripts/${id}/invite/code`
        : `/scripts/${id}/invite/group/${gid}/code`,
    method: 'POST',
    data: option,
  });
  return resp.data;
}
export async function CreateAccessUser(
  id: number,
  option: {
    expiretime: number;
    role: string;
    user_id: number;
  }
) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/access/user`,
    method: 'POST',
    data: option,
  });
  return resp.data;
}
export async function CreateGroupUser(
  id: number,
  gid: number,
  option: {
    expiretime: number;
    user_id: number;
  }
) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/group/${gid}/member`,
    method: 'POST',
    data: option,
  });
  return resp.data;
}

export async function CreateAccessGroup(
  id: number,
  option: {
    expiretime: number;
    role: string;
    group_id: number;
  }
) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/access/group`,
    method: 'POST',
    data: option,
  });
  return resp.data;
}

export async function GetScriptGroupList(id: number, page: number = 1) {
  const resp = await request<
    APIDataResponse<{
      list: Array<ScriptGroup>;
      total: number;
    }>
  >({
    url: '/scripts/' + id + '/group?page=' + page,
    method: 'GET',
  });
  return resp.data;
}

export interface inviteDetail {
  invite_status: number; //1 未使用，2使用，3过期，4等待，5拒绝
  script: {
    username: string;
    name: string;
    id: number;
  };
  group?: {
    name: string;
    description: string;
  };
  access?: {
    role: string;
  };
}
export async function GetInviteMessage(code: string, req?: Request) {
  const headers: { [key: string]: string } = {};
  if (req?.headers.get('Cookie')) {
    headers.cookie = req.headers.get('Cookie') || '';
  }
  const resp = await request<APIDataResponse<inviteDetail>>({
    url: `/scripts/invite/${code}`,
    method: 'GET',
    headers,
  });
  return resp.data;
}

export async function DeleteScriptGroup(id: number, gid: number) {
  const resp = await request<APIResponse>({
    url: `/scripts/${id}/group/${gid}`,
    method: 'DELETE',
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
  public: 1 | 2 | 3;
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

// 更新库信息
export async function UpdateLibInfo(
  id: number,
  params: {
    name: string;
    description: string;
  }
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/lib-info',
    method: 'PUT',
    data: params,
  });
  return resp.data;
}

// 更新同步配置
export async function UpdateScriptSync(
  id: number,
  params: {
    content_url: string;
    sync_mode: number;
    sync_url: string;
    definition_url?: string;
  }
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + id + '/sync',
    method: 'PUT',
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
  const headers: { [key: string]: string } = {};
  if (req?.headers.get('Cookie')) {
    headers.cookie = req.headers.get('Cookie') || '';
  }
  const resp = await request<ScriptStateResponse>({
    url: '/scripts/' + id + '/state',
    method: 'GET',
    headers,
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
