import { fetchUserScriptList, fetchVersionList } from '@App/apis/scripts';
import { Cookies } from 'quasar';
import { ActionTree } from 'vuex';
import http from '../../utils/http';
import { StateInterface } from '../index';
import { ScriptsStateInterface } from './state';

const actions: ActionTree<ScriptsStateInterface, StateInterface> = {
  async fetchScriptList({ commit }, url) {
    try {
      const response = await http.get(url);
      commit('updateScripts', response.data);
    } catch (error) {
      console.log(error);
      commit('updateScripts', { list: [], total: 0 });
    }
  },
  async fetchUserScriptList({ commit }, param: {
    uid: number, sort: string, page: number, count: number,
    category: string, domain: string, keyword: string, cookies?: Cookies
  }) {
    try {
      const response = await fetchUserScriptList(param);
      commit('updateScripts', response.data);
    } catch (error) {
      console.log(error);
      commit('updateScripts', { list: [], total: 0 });
    }
  },
  async fetchScriptInfo({ commit }, param: { id: number, cookies: Cookies }) {
    try {
      const response = await http.get<API.ScriptInfoResponse>('/scripts/' + param.id.toString(), {
        headers: {
          cookie: 'token=' + (param.cookies ? param.cookies.get('token') : ''),
        },
      });
      if (response.data.code === 0) {
        commit('updateScriptInfo', response.data.data);
      } else {
        commit('updateScriptInfo', {});
      }
    } catch (error) {
      console.log(error);
      commit('updateScriptInfo', {});
    }
  },
  fetchVersionList({ commit }, param: { id: number, page: number, count: number, cookies: Cookies }) {
    return fetchVersionList(param).then(resp => {
      commit('updateScriptVersion', resp.data);
    }).catch(() => {
      commit('updateScriptVersion', { list: [], total: 0 });
    });
  }
};


export default actions;