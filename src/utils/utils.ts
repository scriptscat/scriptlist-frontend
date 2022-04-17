import { AxiosResponse } from 'axios';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { QVueGlobals } from 'quasar';

export function formatDate(value: number | Date) {
  return formatDistance(value, new Date(), { addSuffix: true, locale: zhCN });
}

export function goToLoginUrl(path: string): string {
  return (
    'https://bbs.tampermonkey.net.cn/plugin.php?id=codfrm_oauth2:oauth&client_id=' +
    encodeURIComponent(<string>process.env.VUE_APP_BBS_OAUTH_CLIENT) +
    '&scope=user&response_type=code&redirect_uri=' +
    encodeURIComponent(<string>process.env.VUE_APP_HTTP_HOST) +
    '%2Flogin%2Foauth%3Fredirect_uri%3D' +
    encodeURIComponent(path)
  );
}

export function handleResponseError(
  $q: QVueGlobals,
  resp: Promise<AxiosResponse<API.Response<any>>>
): Promise<AxiosResponse<API.Response<any>>> {
  return new Promise((resolve, reject) => {
    resp
      .then((response) => {
        if (response.data.code === 0) {
          resolve(response);
        } else {
          reject();
          $q.notify({
            message: response.data.msg,
            position: 'top',
          });
        }
      })
      .catch(() => {
        reject();
        $q.notify({
          message: '系统错误!',
          position: 'top',
        });
      });
  });
}
