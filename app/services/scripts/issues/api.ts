import type { APIResponse } from '~/services/http';
import { request } from '~/services/http';
import { paramsToSearch } from '~/services/utils';
import type {
  IssueListResponse,
  IssueResponse,
  IssueCommentListResponse,
  IsWatchIssueResponse,
  WatchListResponse,
} from './types';

type IssueListParams = {
  page?: number;
  count?: number;
  keyword?: string;
  labels?: string;
  status?: string;
};

export async function IssueList(scriptId: number, params?: IssueListParams) {
  const resp = await request<IssueListResponse>({
    url: '/scripts/' + scriptId + '/issues?' + paramsToSearch(params),
    method: 'GET',
  });
  return resp.data;
}

export async function GetIssue(scriptId: number, issueId: number) {
  const resp = await request<IssueResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId,
    method: 'GET',
  });
  if (resp.status === 404) {
    return null;
  }
  return resp.data.data;
}

export async function IssueCommentList(scriptId: number, issueId: number) {
  const resp = await request<IssueCommentListResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/comment',
  });
  if (resp.status === 404) {
    return null;
  }
  return resp.data.list;
}

export async function PostComment(
  scriptId: number,
  issueId: number,
  content: string
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/comment',
    method: 'POST',
    data: {
      content,
    },
  });
  return resp.data;
}

export async function UpdateComment(
  scriptId: number,
  issueId: number,
  commentId: number,
  content: string
) {
  const resp = await request<APIResponse>({
    url:
      '/scripts/' + scriptId + '/issues/' + issueId + '/comment/' + commentId,
    method: 'PUT',
    data: {
      content,
    },
  });
  return resp.data;
}

export async function CloseIssue(scriptId: number, issueId: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/close',
    method: 'PUT',
  });
  return resp.data;
}

export async function OpenIssue(scriptId: number, issueId: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/open',
    method: 'PUT',
  });
  return resp.data;
}

export async function UpdateLabels(
  scriptId: number,
  issueId: number,
  labels: string[]
) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/labels',
    method: 'PUT',
    data: {
      labels,
    },
  });
  return resp.data;
}

export async function ListWatchIssue(scriptId: number, issueId: number) {
  const resp = await request<WatchListResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/watchs',
    method: 'GET',
  });
  return resp.data;
}

export async function IsWatchIssue(
  scriptId: number,
  issueId: number,
  req?: Request
) {
  const resp = await request<IsWatchIssueResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/watch',
    method: 'GET',
    headers: {
      Cookie: (req && req.headers.get('Cookie')) || '',
    },
  });
  return resp.data.data;
}

export async function WatchIssue(scriptId: number, issueId: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/watch',
    method: 'POST',
  });
  return resp.data;
}

export async function UnwatchIssue(scriptId: number, issueId: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId + '/watch',
    method: 'DELETE',
  });
  return resp.data;
}

export async function SubmitIssue(
  scriptId: number,
  param: {
    title: string;
    content?: string;
    labels?: string[];
  }
) {
  const resp = await request<IssueResponse>({
    url: '/scripts/' + scriptId + '/issues',
    method: 'POST',
    data: param,
  });
  return resp.data;
}

export async function DeleteIssue(scriptId: number, issueId: number) {
  const resp = await request<APIResponse>({
    url: '/scripts/' + scriptId + '/issues/' + issueId,
    method: 'DELETE',
  });
  return resp.data;
}

export async function DeleteIssueComment(
  scriptId: number,
  issueId: number,
  commentId: number
) {
  const resp = await request<APIResponse>({
    url:
      '/scripts/' + scriptId + '/issues/' + issueId + '/comment/' + commentId,
    method: 'DELETE',
  });
  return resp.data;
}
