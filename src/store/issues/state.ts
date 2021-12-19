export interface IssuesStateInterface {
  issueList: DTO.Issue[]
  issue: DTO.Issue
  commentList: DTO.Comment[]
  total: number
  preFetch: boolean
}

function state(): IssuesStateInterface {
  return {
    issueList: [],
    issue: <DTO.Issue>{},
    commentList: [],
    total: 0,
    preFetch: false
  }
};

export default state;
