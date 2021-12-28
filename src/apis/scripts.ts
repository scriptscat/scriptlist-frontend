import { AxiosRequestConfig } from 'axios';
import { Cookies } from 'quasar';
import http from 'src/utils/http';

export function getRecommendList(url: string) {
  return http.get<API.ScriptListResponse>(url);
}

export function getAllScript(url: string) {
  return http.get<API.ScriptListResponse>(url)
}

export function getScriptInfo(scriptId: number, withCode?: boolean) {
  return http.get<API.ScriptCodeResponse>('/scripts/' + scriptId.toString() + (withCode ? '/code' : ''))
}

export function updateSetting(scriptId: number, setting: DTO.ScriptSetting) {
  return http.put<API.OkResponse>('/scripts/' + scriptId.toString(), setting);
}

export function updateScriptCode(id: number, content: string, code: string, definition: string, changelog: string, scriptPublic: DTO.ScriptPublic, unwell: DTO.ScriptUnwell) {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('code', code);
  formData.append('changelog', changelog);
  formData.append('public', scriptPublic.toString());
  formData.append('unwell', unwell.toString());
  formData.append('definition', definition);
  return http.put<API.OkResponse>('/scripts/' + id.toString() + '/code', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function submitScript(content: string, code: string, type: DTO.ScriptType, scriptPublic: DTO.ScriptPublic, unwell: DTO.ScriptUnwell, definition: string, name: string, description: string) {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('code', code);
  formData.append('type', type.toString());
  formData.append('public', scriptPublic.toString());
  formData.append('unwell', unwell.toString());
  formData.append('definition', definition);
  formData.append('name', name);
  formData.append('description', description);
  return http.post<API.SubmitScriptResponse>('/scripts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function getStatistics(id: number) {
  return http.get<API.ScriptStatisticResponse>('/statistics/script/' + id.toString());
}

export function getRealtime(id: number) {
  return http.get<API.ScriptRealtimeStatisticResponse>('/statistics/script/' + id.toString() + '/realtime');
}

export function fetchUserScriptList(param: {
  uid: number, sort: string, page: number, count: number,
  category: string, domain: string, keyword: string, cookies?: Cookies
}) {
  const config = <AxiosRequestConfig>{};
  if (param.cookies) {
    config.headers = { cookie: 'token=' + (param.cookies ? param.cookies.get('token') : '') };
  }
  return http.get<API.ScriptInfoResponse>('/user/scripts/' + param.uid.toString() +
    '?keyword=' +
    encodeURIComponent(param.keyword || '') +
    '&sort=' +
    encodeURIComponent(param.sort || 'today_download').toString() +
    '&category=' +
    encodeURIComponent(param.category || '').toString() +
    '&domain=' +
    encodeURIComponent(param.domain || '').toString() + '&page=' + (param.page || 1).toString() + '&count=' + (param.count || 20).toString(), config);
}

export function fetchVersionList(param: { id: number, page: number, count: number, cookies: Cookies }) {
  const config = <AxiosRequestConfig>{};
  if (param.cookies) {
    config.headers = { cookie: 'token=' + (param.cookies ? param.cookies.get('token') : '') };
  }
  return http.get<API.ScriptVersionResponse>('/scripts/' + param.id.toString() +
    '/versions?page=' + (param.page || 1).toString() + '&count=' + (param.count || 20).toString(), config);
}

export function watchLevel(scriptId: number) {
  return http.get<API.ScriptWatchResponse>('/scripts/' + scriptId.toString() + '/watch');
}

export function watch(scriptId: number, level: number) {
  return http.post<API.OkResponse>('/scripts/' + scriptId.toString() + '/watch', { level: level });
}

export function unwatch(scriptId: number) {
  return http.delete<API.OkResponse>('/scripts/' + scriptId.toString() + '/watch');
}
