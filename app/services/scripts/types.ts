import type { APIDataResponse, APIListResponse } from '../http';

export type SearchResponse = APIListResponse<Script>;

export type ScriptResponse = APIDataResponse<Script>;

export interface Script {
  id: number;
  uid: number;
  avatar: string;
  username: string;
  name: string;
  description: string;
  content?: string;
  score: number; // 总分
  score_num: number; // 评分人数
  today_install: number; // 今日安装
  total_install: number; // 总安装
  category: Category[];
  createtime: number;
  updatetime: number;
}

export interface Category {
  id: number;
  name: string;
  num: number;
}
