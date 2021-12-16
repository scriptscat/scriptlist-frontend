export interface IssuesStateInterface {
  issueList: DTO.IssueList[]
  commentList: DTO.Comment[]
  total: number
  preFetch: boolean
}

function state(): IssuesStateInterface {
  return {
    issueList: [],
    commentList: [],
    total: 0,
    preFetch: false
  }
};

export default state;
