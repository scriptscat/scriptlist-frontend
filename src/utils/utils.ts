import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale'
import { QVueGlobals } from 'quasar';

export function formatDate(value: number | Date) {
	return formatDistance(value, new Date(), { addSuffix: true, locale: zhCN });
}

export function responseErrorHandler($q: QVueGlobals, error: any) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	if (error.response && error.response.data.msg !== undefined) {
		$q.notify({
			color: 'orange',
			icon: 'warning',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			message: error.response.data.msg,
			position: 'top',
		});
	} else {
		$q.notify({
			color: 'red',
			icon: 'error',
			message: '系统错误!',
			position: 'top',
		});
	}
}

export function goToLoginUrl(path: string): string {
	return 'https://bbs.tampermonkey.net.cn/plugin.php?id=codfrm_oauth2:oauth&client_id=' +
		encodeURIComponent(<string>process.env.VUE_APP_BBS_OAUTH_CLIENT) +
		'&scope=user&response_type=code&redirect_uri=' +
		encodeURIComponent(<string>process.env.VUE_APP_HTTP_HOST) +
		'%2Flogin%2Foauth%3Fredirect_uri%3D' +
		encodeURIComponent(path);
}
