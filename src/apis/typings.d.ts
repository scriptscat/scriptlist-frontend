declare namespace API {
  type Response<T> = {
    code: number;
    msg: string;
    data: T;
  };

  type PageRequest = {
    [key: string]: string;
    page: number;
    count: number;
  };

  type OkResponse = Response<any>;

  type Response<T> = {
    code: number;
    msg: string;
    data: T;
  };

  type ListResponse<T> = {
    code: number;
    msg: string;
    list: T[];
    total: number;
  };

  type UserInfoResponse = Response<{
    follow: DTO.Follow;
    user: DTO.User;
  }>;

  type UserConfigResponse = Response<{
    notify: DTO.UserNotify;
  }>;

  type ScriptListResponse = ListResponse<DTO.Script>;

  type WebhookResponse = Response<{
    token: string;
  }>;

  type ScriptInfoResponse = Response<DTO.Script>;

  type ScriptVersionResponse = Response<DTO.ScriptCode>;

  type CommontResponse = Response<DTO.Comment>;

  type CommontListResponse = ListResponse<DTO.Comment>;

  type ScriptCodeResponse = Response<DTO.Script>;

  type IssueResponse = Response<DTO.Issue>;

  type IssueListResponse = ListResponse<DTO.Issue>;

  type UploadImage = Response<DTO.UploadImage>;

  type SubmitScriptResponse = Response<{ id: number }>;

  type ScriptStatisticResponse = Response<{
    download: {
      pv: DTO.StatisticXY;
      realtime: DTO.StatisticXY;
      uv: DTO.StatisticXY;
      'uv-lastweekly': DTO.StatisticXY;
    };
    member: { num: number };
    update: {
      pv: DTO.StatisticXY;
      realtime: DTO.StatisticXY;
      uv: DTO.StatisticXY;
      'uv-lastweekly': DTO.StatisticXY;
    };
  }>;

  type ScriptRealtimeStatisticResponse = Response<{
    download: DTO.StatisticXY;
    update: DTO.StatisticXY;
  }>;

  type ScriptWatchResponse = Response<{ level: number }>;
}

declare namespace DTO {
  type StatisticXY = {
    x: string[];
    y: string[];
  };

  type ScriptType = 1 | 2 | 3;

  type ScriptPublic = 1 | 2;

  type ScriptUnwell = 1 | 2;

  type Script = {
    id: number;
    name: string;
    namespace: string;
    description: string;
    today_install: number;
    total_install: number;
    uid: number;
    username: string;
    script: ScriptCode;
    type: ScriptType;
    public: ScriptPublic;
    unwell: ScriptUnwell;
    content: string;
    score: number;
    createtime: number;
    updatetime: number;
    is_manager: boolean;
    archive: number;
    setting?: ScriptSetting;
  };

  type ScriptSetting = {
    sync_url: string;
    sync_mode: string;
    content_url: string;
    definition_url: string;
  };

  type ScriptCode = {
    code: string;
    version: string;
  };

  type User = {
    uid: number;
    username: string;
  };

  type Follow = {
    // 粉丝
    followers: number;
    // 关注
    following: number;
  };

  type Comment = {
    avatar?: string;
    score: number;
    message: string;
  };

  const IssueStatusOpen = 1;
  const IssueStatusClose = 3;
  type IssueStatus = IssueStatusOpen | IssueStatusClose;

  type Issue = {
    id: number;
    title: string;
    uid: number;
    username: string;
    content: string;
    status: number;
    labels: Array[string];
    createtime: number;
  };

  type IssueCommentType = 1 | 2 | 3;

  type IssueComment = {
    id: number;
    uid: number;
    username: string;
    content: string;
    type: IssueCommentType;
    status: number;
    createtime: number;
  };

  type UploadImage = {
    id: string;
  };

  type UserNotify = {
    at: boolean;
    create_script: boolean;
    score: boolean;
    script_issue: boolean;
    script_issue_comment: boolean;
    script_updat: boolean;
  };
}
