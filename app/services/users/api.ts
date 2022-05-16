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
