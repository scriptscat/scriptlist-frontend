import type { APIDataResponse, APIListResponse } from '../http';

export type SearchResponse = APIListResponse<Script>;

export type ScriptListResponse = APIListResponse<Script>;

export type ScriptResponse = APIDataResponse<Script>;

export type ScriptSettingResponse = APIDataResponse<ScriptSetting>;

export type Script = {
  id: number;
  uid: number;
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
  changelog: string;
  version: string;
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

export type ScriptSetting = {};
