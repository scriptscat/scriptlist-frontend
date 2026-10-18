export interface ListData<T> {
  list: T[];
  total: number;
}

export interface APIResponse<T> {
  [key: string]: any;
  code: number;
  msg: string;
  data: T;
}

export interface LocalizedSummary {
  zh: string;
  en: string;
}

// 分页请求参数
export interface PageRequest {
  page?: number;
  size?: number;
}

/** 失败的那次请求，供错误上报归因到具体接口 */
export interface APIRequestInfo {
  method: string;
  /** 不含查询串的接口路径 */
  endpoint: string;
  /** 从发起到失败的毫秒数 */
  duration: number;
  contentType?: string;
}

// API错误类型
export class APIError extends Error {
  request?: APIRequestInfo;

  constructor(
    public statusCode: number,
    public code: number,
    public msg: string,
    public data?: any,
  ) {
    super(msg);
    this.name = 'APIError';
  }
}

// 用户组相关类型
export interface GroupMember {
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  invite_status: number;
  expiretime: number;
}

export interface ScriptGroup {
  id: number;
  name: string;
  description: string;
  member: GroupMember[];
}

// 通知相关类型
export interface Notification {
  id: number;
  user_id: number;
  from_user_id?: number;
  from_user?: {
    user_id: number;
    username: string;
    avatar: string;
    is_admin: number;
  };
  type: number;
  title: string;
  content: string;
  link?: string;
  read_status: number;
  read_time?: number;
  createtime: number;
  updatetime: number;
}

// 内容举报（评价 / 反馈 / 反馈回复）
export type ContentReportTargetType = 'score' | 'issue' | 'issue_comment';

export type ContentReportReason =
  'spam' | 'abuse' | 'porn' | 'illegal' | 'misleading' | 'other';

/** 内容举报状态：1 待处理 | 2 已处理 | 3 已驳回 */
export type ContentReportStatus = 1 | 2 | 3;

/** 结案结果；待处理时为空串 */
export type ContentReportHandleResult =
  '' | 'deleted' | 'resolved' | 'rejected';

/** 管理后台内容举报列表项 */
export interface AdminContentReportItem {
  id: number;
  target_type: ContentReportTargetType;
  target_id: number;
  issue_id: number;
  script_id: number;
  /** 脚本已删除时为空串 */
  script_name: string;
  author_id: number;
  author_name: string;
  /** 后端已截断；反馈以【标题】开头 */
  summary: string;
  target_deleted: boolean;
  reason: ContentReportReason;
  /** 举报人补充说明 */
  content: string;
  user_id: number;
  username: string;
  /** 该内容当前待处理举报数 */
  pending_count: number;
  status: ContentReportStatus;
  handle_result: ContentReportHandleResult;
  createtime: number;
}

/** 举报时保存的内容快照 */
export interface ContentReportSnapshot {
  title: string;
  content: string;
  score: number;
  createtime: number;
}

/** 同一内容下的单条举报记录 */
export interface ContentReportRecord {
  id: number;
  user_id: number;
  username: string;
  reason: ContentReportReason;
  content: string;
  status: ContentReportStatus;
  createtime: number;
}

export interface AdminContentReportDetail extends AdminContentReportItem {
  snapshot: ContentReportSnapshot;
  handler_id: number;
  handler_name: string;
  handle_note: string;
  handletime: number;
  reports: ContentReportRecord[];
}

export interface ContentReportHandleBody {
  action: 'delete' | 'resolve' | 'reject';
  /** 仅管理员可见，≤500 字 */
  note?: string;
}

export interface CreateContentReportRequest {
  target_type: ContentReportTargetType;
  target_id: number;
  /** target_type 为 issue_comment 时必填 */
  issue_id?: number;
  reason: ContentReportReason;
  content?: string;
}
