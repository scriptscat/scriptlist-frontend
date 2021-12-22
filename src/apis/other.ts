import http from '@App/utils/http';

export function csrfToken(script: number) {
	return http.get<{ csrf: string }>('/statistics/script/' + script.toString() + '/csrf');
}

export function downloadStatistics(script: number, _csrf: string) {
	return http.post('/statistics/script/' + script.toString() + '/download', { id: script, '_csrf': _csrf }, {
		headers: {
			'X-CSRF-Token': _csrf,
		}
	});
}