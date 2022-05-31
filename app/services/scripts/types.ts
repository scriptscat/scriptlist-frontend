import type { APIDataResponse, APIListResponse } from '../http';

export type SearchResponse = APIListResponse<Script>;

export type ScriptListResponse = APIListResponse<Script>;

export type ScriptVersionListResponse = APIListResponse<ScriptCode>;

export type ScriptResponse = APIDataResponse<Script>;

export type ScriptSettingResponse = APIDataResponse<ScriptSetting>;

export type CreateScriptResponse = APIDataResponse<Script>;

export type Script = {
  id: number;
  uid: number;
  post_id: number;
  avatar: string;
  username: string;
  name: string;
  description: string;
  script: ScriptCode;
  content?: string;
  score: number; // 总分
  score_num: number; // 评分人数
  today_install: number; // 今日安装
  total_install: number; // 总安装
  unwell: 1 | 2; // 不适内容
  public: 1 | 2; // 是否公开
  archive: 0 | 1; // 归档
  type: 1 | 2 | 3; // 1: 普通脚本, 2: 订阅脚本, 3: 库
  category: Category[];
  createtime: number;
  updatetime: number;
};

export interface Category {
  id: number;
  name: string;
  num: number;
}

export type ScriptCode = {
  id: number;
  code: string;
  changelog: string;
  version: string;
  meta_json: { [key: string]: string[] };
  createtime: number;
  updatetime: number;
};

export type ScoreListResponse = APIListResponse<ScoreItem>;
export type MyScoreResponse = APIDataResponse<ScoreItem>;

export type ScoreItem = {
  id: number;
  uid: number;
  username: string;
  avatar: string;
  score: number;
  message: string;
  createtime: number;
};

export type ScriptSetting = {
  sync_url: string;
  content_url: string;
  definition_url: string;
  sync_mode: 1 | 2; // 1 自动 2 手动
};
