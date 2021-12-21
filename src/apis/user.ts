import http from 'src/utils/http';

export function fetchUserInfo(uid: number) {
    return http.get<API.UserInfoResponse>('/user/info/' + uid.toString());
}

export function getWebhook() {
    return http.get<API.WebhookResponse>('/user/webhook');
}

export function updateWebhook() {
    return http.put<API.WebhookResponse>('/user/webhook');
}

export function fetchUserConfig() {
    return http.get<API.UserConfigResponse>('/user/config');
}

export function updateUserNotifyConfig(notify: DTO.UserNotify) {
    return http.put<API.OkResponse>('/user/config/notify', notify);
}

export function isFollow(uid: number) {
    return http.get<API.OkResponse>('/user/follow/' + uid.toString());
}

export function follow(uid:number){
    return http.post<API.OkResponse>('/user/follow/' + uid.toString());
}

export function unfollow(uid:number){
    return http.delete<API.OkResponse>('/user/follow/' + uid.toString());
}