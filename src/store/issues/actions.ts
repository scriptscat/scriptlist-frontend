import { ActionTree } from 'vuex';
import http from '../../utils/http';
import { StateInterface } from '../index';
import { IssuesStateInterface } from './state';

const actions: ActionTree<IssuesStateInterface, StateInterface> = {
  fetchIssueList({ commit }, param: { count: number, page: number, scriptId: number }) {
    return http.get('/scripts/' + param.scriptId.toString() + '/issues/?page=' + param.page.toString() + '&count=' + param.count.toString())
      .then(response => {
        commit('updateIssueList', response.data);
      })
      .catch(error => {
        console.log(error);
        commit('updateIssueList', { list: [], total: 0 });
      });
  },
  fetchCommentList({ commit }, param: { scriptId: number, issueId: number }) {
    return http.get('/scripts/' + param.scriptId.toString() + '/issues/' + param.issueId.toString() + '/comment')
      .then(response => {
        commit('updateCommentList', response.data);
      })
      .catch(error => {
        console.log(error);
        commit('updateCommentList', { list: [], total: 0 });
      });
  },
};


export default actions;