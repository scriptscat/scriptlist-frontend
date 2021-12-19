import http from 'src/utils/http';

export function submitIssue(script: number, title: string, content: string, label: string[]) {
	return http.post<API.IssueResponse>('/scripts/' + script.toString() + '/issues', {
		title: title,
		content: content,
		label: label.join(',')
	});
}

export function fetchIssue(script: number, issue: number) {
	return http.put<API.IssueResponse>('/scripts/' + script.toString() + '/issues/' + issue.toString());
}

export function updateIssue(script: number, issue: number, title: string, content: string, label: string[]) {
	return http.put<API.OkResponse>('/scripts/' + script.toString() + '/issues/' + issue.toString(), {
		title: title,
		content: console,
		label: label.join(',')
	});
}

export function submitIssueComment(script: number, issue: number, content: string) {
	return http.post<API.OkResponse>('/scripts/' + script.toString() + '/issues/' + issue.toString() + '/comment', {
		content: content
	});
}

export function updateIssueComment(script: number, issue: number, comment: number, content: string) {
	return http.put<API.OkResponse>('/scripts/' + script.toString() + '/issues/' + issue.toString() + '/comment/' + comment.toString(), {
		content: content
	});
}

export function fetchIssueList(param: { count: number, page: number, scriptId: number }) {
	return http.get('/scripts/' + param.scriptId.toString() + '/issues/?page=' + param.page.toString() + '&count=' + param.count.toString());
}

export function closeIssue(script: number, issue: number) {
	return http.put<API.OkResponse>('/scripts/' + script.toString() + '/issues/' + issue.toString() + '/close');
}

export function openIssue(script: number, issue: number) {
	return http.put<API.OkResponse>('/scripts/' + script.toString() + '/issues/' + issue.toString() + '/open');
}