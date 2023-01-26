import type { APIDataResponse } from '../http';

export type LoginUserinfoResponse = APIDataResponse<User>;

export type WebhookResponse = APIDataResponse<Webhook>;

export type UserConfigResponse = APIDataResponse<UserConfig>;

export type GetFollowResponse = APIDataResponse<Follow>;

export interface User {
  user_id: number;
  username: string;
  avatar: string;
  is_admin: 0 | 1 | 2 | 3;
}

export interface Follow {
  is_follow: boolean;
  // 粉丝
  followers: number;
  // 关注
  following: number;
}

export type Webhook = {
  token: string;
};

export type UserConfig = {
  notify: { [key: string]: boolean };
};
