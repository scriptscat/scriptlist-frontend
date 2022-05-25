import { request } from '../http';
import { Follow, LoginUserinfoResponse, User } from './types';

export async function loginUserinfoAndRefushToken({
  token,
}: {
  token: string;
}): Promise<{
  user: {
    follow: Follow;
    user: User;
  };
  setCookie?: string[];
}> {
  const resp = await request<LoginUserinfoResponse>({
    url: '/user/info',
    method: 'GET',
    headers: {
      cookie: 'token=' + token,
    },
  });

  return { user: resp.data.data, setCookie: resp.headers['set-cookie'] };
}

export async function GetUserInfo(uid: number) {
  const resp = await request<LoginUserinfoResponse>({
    url: '/user/info/' + uid,
    method: 'GET',
  });
  if (resp.status == 404) {
    return null;
  }
  return resp.data.data;
}
