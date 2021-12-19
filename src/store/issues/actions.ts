import { closeIssue, openIssue, submitIssueComment } from '@App/apis/issue';
import { ActionTree } from 'vuex';
import http from '../../utils/http';
import { StateInterface } from '../index';
import { IssuesStateInterface } from './state';

const actions: ActionTree<IssuesStateInterface, StateInterface> = {
  fetchIssueList({ commit }, param: { count: number, page: number, scriptId: number }) {
    return http.get('/scripts/' + param.scriptId.toString() + '/issues?page=' + param.page.toString() + '&count=' + param.count.toString())
      .then(response => {
        commit('updateIssueList', response.data);
      })
      .catch(error => {
        console.log(error);
        commit('updateIssueList', { list: [], total: 0 });
      });
  },
  fetchIssue({ commit }, param: { scriptId: number, issueId: number }) {
    return http.get<API.IssueResponse>('/scripts/' + param.scriptId.toString() + '/issues/' + param.issueId.toString())
      .then(response => {
        commit('updateIssue', { issue: response.data.data });
      })
      .catch(error => {
        console.log(error);
        commit('updateIssue', { issue: {} });
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
  submitComment({ commit }, param: { script: number, issue: number, content: string }) {
    return submitIssueComment(param.script, param.issue, param.content).then(resp => {
      commit('addComment', resp.data.data);
      return resp;
    });
  },
  openIssue({ commit }, param: { script: number, issue: number }) {
    return openIssue(param.script, param.issue).then(resp => {
      commit('openIssue', resp.data.data);
      return resp;
    });
  },
  closeIssue({ commit }, param: { script: number, issue: number }) {
    return closeIssue(param.script, param.issue).then(resp => {
      commit('closeIssue', resp.data.data);
      return resp;
    });
  },
};


export default actions;