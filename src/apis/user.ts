import http from 'src/utils/http';

export function fetchUserInfo(uid: number) {
    return http.get<API.UserInfoResponse>('/user/info/' + uid.toString());
}

export function getWebhook() {
    return http.get<API.WebhookResponse>('user/webhook');
}

export function updateWebhook() {
    return http.put<API.WebhookResponse>('user/webhook');
}