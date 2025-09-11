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

// 分页请求参数
export interface PageRequest {
  page?: number;
  size?: number;
}

// API错误类型
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: number,
    public msg: string,
    public data?: any,
  ) {
    super(msg);
    this.name = 'APIError';
    this.message = JSON.stringify({ statusCode, code, msg, data });
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
