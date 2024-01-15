import type { GrayControlValue } from '~/components/GrayControl';
import type { APIDataResponse, APIListResponse } from '../http';

export type SearchResponse = APIListResponse<Script>;

export type ScriptListResponse = APIListResponse<Script>;

export type ScriptVersionListResponse = APIListResponse<ScriptCode>;

export type ScriptResponse = APIDataResponse<Script>;

export type ScriptSettingResponse = APIDataResponse<ScriptSetting>;

export type CreateScriptResponse = APIDataResponse<Script>;

export type ScriptStateResponse = APIDataResponse<{
  watch: WatchLevel;
}>;

export type StatisticsResponse = APIDataResponse<Statistics>;

export type PieChart = Array<{ key: string; value: number }>;

export type AdvStatistics = {
  statistics_key: string;
  whitelist?: string[];
  limit: { quota: number; usage: number };
  pv: Overview;
  uv: Overview;
  ip: Overview;
  use_time: Overview;
  new_old_user: PieChart;
  version: PieChart;
  system: PieChart;
  browser: PieChart;
};

export type AdvStatisticsResponse = APIDataResponse<AdvStatistics>;

export type AdvRealtimeChart = {
  chart: StatisticsChart;
};

export type AdvRealtimeChartResponse = APIDataResponse<AdvRealtimeChart>;

export type AdvRealtime = {};

export type AdvRealtimeResponse = APIDataResponse<AdvRealtime>;

export type RealtimeResponse = APIDataResponse<Realtime>;

export type OriginListResponse = APIListResponse<PieChart>;

export type VisitDomainResponse = APIListResponse<PieChart>;

export type VisitListItem = {
  visitor_id: string;
  operation_page: string;
  duration: number;
  visit_time: number;
  exit_time: number;
};

export type VisitListResponse = APIListResponse<VisitListItem>;

export type UpdateWhitelistResponse = APIDataResponse<{ whitelist: string[] }>;

export type Script = {
  id: number;
  user_id: number;
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
  archive: 1 | 2; // 归档
  danger: 1 | 2; // 存在危险性
  type: 1 | 2 | 3; // 1: 普通脚本, 2: 订阅脚本, 3: 库
  enable_pre_release: 1 | 2; // 是否开启预发布
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
  is_pre_release: number;
  version: string;
  meta_json: { [key: string]: string[] };
  createtime: number;
  updatetime: number;
};

export type ScoreListResponse = APIListResponse<ScoreItem>;
export type MyScoreResponse = APIDataResponse<ScoreItem>;

export type ScoreItem = {
  id: number;
  user_id: number;
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
  gray_controls: GrayControlValue[];
  enable_pre_release: 1 | 2; // 是否开启预发布
};

export type WatchLevel = 0 | 1 | 2 | 3;

export type Overview = {
  today: number;
  yesterday: number;
  week: number;
};

export type Statistics = {
  page_pv: Overview;
  page_uv: Overview;
  download_uv: Overview;
  update_uv: Overview;
  uv_chart: {
    download: StatisticsChart;
    update: StatisticsChart;
  };
  pv_chart: {
    download: StatisticsChart;
    update: StatisticsChart;
  };
};

export type StatisticsChart = {
  x: string[];
  y: number[];
};

export type Realtime = {
  download: StatisticsChart;
  update: StatisticsChart;
};

export interface ScriptGroup {
  createtime: number;
  description: string;
  id: number;
  member: Array<any>;
  member_count: number;
  name: string;
}
