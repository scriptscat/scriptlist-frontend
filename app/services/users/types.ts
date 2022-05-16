import type { APIDataResponse } from '../http';

export type LoginUserinfoResponse = APIDataResponse<{
  follow: Follow;
  user: User;
}>;

export interface User {
  uid: number;
  username: string;
  avatar: string;
}

export interface Follow {
  // 粉丝
  followers: number;
  // 关注
  following: number;
}
