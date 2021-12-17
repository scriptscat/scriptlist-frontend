declare namespace API {
  type Response<T> = {
    code: number;
    msg: string;
    data: T;
  };

    type OkResponse = Response<undefined>;

    type Response<T> = {
        code: number;
        msg: string;
        data: T;
    };

    type ListResponse<T> = {
        code: number;
        msg: string;
        list: T[];
    }

  type UserInfoResponse = Response<{
    user: DTO.User;
  }>;

  type ScriptListResponse = ListResponse<DTO.Script>;

  type WebhookResponse = Response<{
    token: string;
  }>;

  type ScriptInfoResponse = Response<DTO.Script>;

  type CommontResponse = Response<DTO.Comment>;

    type ScriptCodeResponse = Response<DTO.Script>

    type UploadImage = Response<DTO.UploadImage>

    type SubmitScriptResponse = Response<{ id: number }>
}

declare namespace DTO {
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
    content: string;
    score: number;
    createtime: number;
    updatetime: number;
    is_manager: boolean;
  };

  type ScriptCode = {
    version: string;
  };

  type User = {
    uid: number;
  };

    type ScriptType = 1 | 2 | 3;

    type ScriptPublic = 1 | 2;

    type ScriptUnwell = 1 | 2;

    type Script = {
        id: number, name: string, namespace: string, description: string, today_install: number, total_install: number
        uid: number, username: string, script: ScriptCode, type: ScriptType, public: ScriptPublic, unwell: ScriptUnwell
        content: string
        score: number
        createtime: number, updatetime: number
        is_manager: boolean
    }

    type ScriptCode = {
        code: string
        version: string
    }

    type User = {
        uid: number
    };

    type Issue = {
        id: number
    }

    type Comment = {
        id: number
    }

    type UploadImage = {
        id: string
    }
}
