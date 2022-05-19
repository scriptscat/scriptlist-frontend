import { request } from '~/services/http';
import { paramsToSearch } from '~/services/utils';
import {
  IssueListResponse,
  Issue,
  IssueResponse,
  IssueCommentListResponse,
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
