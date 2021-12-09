import { MutationTree } from 'vuex';
import { IssuesStateInterface } from './state';

const mutation: MutationTree<IssuesStateInterface> = {
  updateIssuesList(state, { list, total }) {
    state.issueList = list;
    // 处理bg类型脚本
    state.total = total;
  }
};

export default mutation;
