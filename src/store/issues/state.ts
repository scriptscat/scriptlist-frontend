export interface IssuesStateInterface {
  issueList: DTO.IssueList[]
  commentList: DTO.Comment[]
  total: number
}

function state(): IssuesStateInterface {
  return {
    issueList: [],
    commentList: [],
    total: 0,
  }
};

export default state;
