import Http from 'src/utils/http';

export function getRecommendList(url: string) {
  return Http.get<API.ScriptListResponse>(url);
}

export function getAllScript(url: string) {
  return Http.get<API.ScriptListResponse>(url)
}