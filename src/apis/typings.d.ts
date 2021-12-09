
declare namespace API {

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
        user: DTO.User
    }>;


    type ScriptListResponse = ListResponse<DTO.Script>;

    type WebhookResponse = Response<{
        token: string
    }>;

    type ScriptInfoResponse = Response<DTO.Script>

}

declare namespace DTO {

    type Script = {
        id: number, name: string, namespace: string, description: string, today_install: number, total_install: number
        uid: number, username: string, script: ScriptCode
        content: string
        score: number
        createtime: number, updatetime: number
        is_manager: boolean
    }

    type ScriptCode = {
        version: string
    }

    type User = {
        uid: number
    };

}