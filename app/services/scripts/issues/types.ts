import type { APIDataResponse, APIListResponse } from '~/services/http';

export type IssueStatusType = 1 | 2 | 3;

export type IssueListResponse = APIListResponse<Issue>;

export type IssueResponse = APIDataResponse<Issue>;

export type Issue = {
  id: number;
  uid: number;
  title: string;
  content: string;
  username: string;
  labels: string[];
  status: IssueStatusType;
  createtime: number;
  updatetime: number;
};

export type IssueCommentListResponse = APIListResponse<IssueComment>;

export type IssueComment = {
  id: number;
  uid: number;
};
