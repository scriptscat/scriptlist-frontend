import { ActionTree } from 'vuex';
import http from '../../utils/http';
import { StateInterface } from '../index';
import { ScriptsStateInterface } from './state';

export interface ScriptInfo {
  code: number
  data: any
}

const actions: ActionTree<ScriptsStateInterface, StateInterface> = {
  fetchScriptList({ commit }, url) {
    return http.get(url)
      .then(response => {
        commit('updateScripts', response.data);
      })
      .catch(error => {
        console.log(error);
        commit('updateScripts', { list: [], total: 0 });
      });
  },
  fetchScriptInfo({ commit }, { id }) {
    return http.get<ScriptInfo>('/scripts/' + <string>id, {}).then(response => {
      if (response.data.code === 0) {
        commit('updateScriptInfo', response.data.data);
      } else {
        commit('updateScriptInfo', {});
      }
    }).catch(error => {
      console.log(error);
      commit('updateScriptInfo', {});
    });
  }
};


export default actions;