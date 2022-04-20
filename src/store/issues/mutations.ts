import { MutationTree } from 'vuex';
import { IssuesStateInterface } from './state';

const mutation: MutationTree<IssuesStateInterface> = {
  updateIssueList(state, { list, total }) {
    state.issueList = list;
    // 处理bg类型脚本
    state.total = total;
    state.preFetch = true;
  },
  updateIssue(state, { issue }) {
    state.issue = issue;
  },
  updateCommentList(state, { list }) {
    state.commentList = list || [];
    state.preFetch = true;
  },
  resetPreFetch(state) {
    state.preFetch = false;
  },
  addComment(state, comment) {
    state.commentList.push(comment);
  },
  closeIssue(state, comment) {
    if (!state.issue) {
      return;
    }
    state.issue.status = 3;
    state.commentList.push(comment);
  },
  openIssue(state, comment) {
    if (!state.issue) {
      return;
    }
    state.issue.status = 1;
    state.commentList.push(comment);
  },
};

export default mutation;
