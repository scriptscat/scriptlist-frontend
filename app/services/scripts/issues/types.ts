import type { APIDataResponse, APIListResponse } from '~/services/http';
import type { User } from '~/services/users/types';

export type IssueStatusType = 1 | 3;

export type IssueListResponse = APIListResponse<Issue>;

export type IssueResponse = APIDataResponse<Issue>;

export type WatchListResponse = APIListResponse<User>;

export type IsWatchIssueResponse = APIDataResponse<IsWatchIssue>;

export type IsWatchIssue = { watch: 0 | 1 };

export type Issue = {
  id: number;
  user_id: number;
  avatar: string;
  title: string;
  content: string;
  username: string;
  labels: string[];
  status: IssueStatusType; // 0:删除 1: 待解决 3: 已关闭
  createtime: number;
  updatetime: number;
};

export type IssueCommentListResponse = APIListResponse<IssueComment>;

export type IssueComment = {
  id: number;
  user_id: number;
  avatar: string;
  username: string;
  content: string;
  type: 1 | 2 | 3 | 4 | 5 | 6; // 1:comment 2:change-title 3:change-label 4:open 5:close 6:delete
  createtime: number;
};
