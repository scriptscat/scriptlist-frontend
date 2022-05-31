import type { APIDataResponse } from '../http';

export type LoginUserinfoResponse = APIDataResponse<{
  follow: Follow;
  user: User;
}>;

export interface User {
  uid: number;
  username: string;
  avatar: string;
  is_admin: 0 | 1 | 2 | 3;
}

export interface Follow {
  // 粉丝
  followers: number;
  // 关注
  following: number;
}
