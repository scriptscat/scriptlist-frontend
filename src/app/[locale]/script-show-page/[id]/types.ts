import type { PageRequest } from '@/types/api';

export interface ScriptListItem {
  script: Script;
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  is_admin: number;
  post_id: number;
  name: string;
  description: string;
  category: Category;
  tags: Category[];
  status: number;
  score: number;
  score_num: number;
  type: number;
  public: number;
  unwell: number;
  archive: number;
  danger: number;
  enable_pre_release: number;
  today_install: number;
  total_install: number;
  createtime: number;
  updatetime: number;
}

export interface ScriptInfo {
  script: Script;
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  is_admin: number;
  post_id: number;
  name: string;
  description: string;
  category: Category;
  tags: Category[];
  status: number;
  score: number;
  score_num: number;
  type: number; // 1 用户脚本 2 订阅脚本 3 库
  public: number;
  unwell: number;
  archive: number;
  danger: number;
  enable_pre_release: number;
  today_install: number;
  total_install: number;
  createtime: number;
  updatetime: number;
  content: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  num: number;
  sort: number;
  createtime: number;
  updatetime: number;
}

export interface MetaJson {
  antifeature?: string[];
  author?: string[];
  compatible?: string[];
  connect?: string[];
  description: string[];
  exclude?: string[];
  grant?: string[];
  include?: string[];
  license?: string[];
  match?: string[];
  name: string[];
  namespace?: string[];
  require?: string[];
  'run-at'?: string[];
  version?: string[];
  icon?: string[];
  iconURL?: string[];
  background?: string[];
  crontab?: string[];
}

export type Metadata = { [key: string]: string[] } & MetaJson;

export interface Script {
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  is_admin: number;
  meta_json: Metadata;
  script_id: number;
  version: string;
  changelog: string;
  is_pre_release: number;
  status: number;
  createtime: number;
  code: string;
}

export interface ScriptAntiFeature {
  type:
    | 'ads'
    | 'tracking'
    | 'miner'
    | 'payment'
    | 'membership'
    | 'referral-link';
  description: string;
}

export interface ScriptDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export interface ScriptDetailLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
    id: string;
  };
}

// 脚本搜索请求参数
export interface ScriptSearchRequest extends PageRequest {
  keyword?: string;
  domain?: string;
  category?: string;
  user_id?: number;
  script_type?: 0 | 1 | 2 | 3 | 4; // 0:全部 1: 脚本 2: 库 3: 后台脚本 4: 定时脚本
  sort?:
    | 'today_download'
    | 'total_download'
    | 'score'
    | 'createtime'
    | 'updatetime';
}

// 脚本同步配置参数
export interface ScriptSyncRequest {
  content_url: string; // 脚本说明同步地址
  sync_mode: number; // 同步方式：1 自动同步, 2 手动同步
  sync_url: string; // 同步地址
  definition_url?: string; // 定义文件地址（可选）
}

// 脚本设置类型
export interface ScriptSetting {
  sync_url: string;
  content_url: string;
  definition_url: string;
  sync_mode: 1 | 2; // 1 自动 2 手动
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  gray_controls: import('./components/GrayControl').GrayControlValue[];
  enable_pre_release: 1 | 2; // 是否开启预发布
}

// 脚本设置响应类型
export interface ScriptSettingResponse {
  data: ScriptSetting;
}

export interface InviteListItem {
  id: number;
  code: string;
  used: number;
  username: string;
  is_audit: boolean;
  invite_status: number;
  expiretime: number;
  createtime: number;
}

export interface AccessRoleItem {
  id: number;
  link_id: number;
  name: string;
  avatar: string;
  type: number; // id类型 1=用户id 2=组id
  invite_status: number; // 邀请状态 1=已接受 2=已拒绝 3=待接受
  role: string;
  is_expire: boolean;
  expiretime: number;
  createtime: number;
}

export interface InviteMessage {
  invite_status: number; //1 未使用，2使用，3过期，4等待，5拒绝
  script: {
    username: string;
    name: string;
    id: number;
  };
  group?: {
    name: string;
    description: string;
  };
  access?: {
    role: string;
  };
}

// 关注级别枚举
export enum WatchLevel {
  NONE = 0, // 不关注
  VERSION = 1, // 版本更新
  FEEDBACK = 2, // 新建反馈
  ALL = 3, // 任何动态
}

// 脚本状态
export interface ScriptState {
  watch: WatchLevel;
  favorite_ids: number[];
  watch_count: number;
  favorite_count: number;
}

// 脚本状态响应
export interface ScriptStateResponse {
  code: number;
  msg: string;
  data: ScriptState;
}
