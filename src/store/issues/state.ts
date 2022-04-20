export interface IssuesStateInterface {
  issueList: DTO.Issue[]
  issue?: DTO.Issue
  commentList: DTO.IssueComment[]
  total: number
  preFetch: boolean
}

function state(): IssuesStateInterface {
  return {
    issueList: [],
    issue: undefined,
    commentList: [],
    total: 0,
    preFetch: false
  }
};

export default state;
