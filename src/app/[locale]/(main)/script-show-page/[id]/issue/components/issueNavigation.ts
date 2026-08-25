type OpenWindow = (url?: string | URL, target?: string) => Window | null | void;

export function openIssueDetail(
  scriptId: number,
  issueId: number,
  openWindow: OpenWindow = window.open.bind(window),
) {
  openWindow(`/script-show-page/${scriptId}/issue/${issueId}`, '_blank');
}
