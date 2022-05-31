import { APIResponse, request } from '../http';
import type {
  Follow,
  LoginUserinfoResponse,
  User,
  UserConfigResponse,
  WebhookResponse,
} from './types';

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

export async function GetWebhook(req?: Request) {
  const resp = await request<WebhookResponse>({
    url: '/user/webhook',
    method: 'GET',
    headers: {
      cookie: req?.headers.get('cookie') || '',
    },
  });
  return resp.data;
}

export async function RefreshWebhookToken() {
  const resp = await request<WebhookResponse>({
    url: '/user/webhook',
    method: 'PUT',
  });
  return resp.data;
}

export async function UserConfig(req: Request) {
  const resp = await request<UserConfigResponse>({
    url: '/user/config',
    method: 'GET',
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  });
  return resp.data;
}

export async function SetUsetNotify(notify: { [key: string]: boolean }) {
  const resp = await request<APIResponse>({
    url: '/user/config/notify',
    method: 'PUT',
    data: notify,
  });
  return resp.data;
}
