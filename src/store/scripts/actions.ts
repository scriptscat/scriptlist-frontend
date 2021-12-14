import { Cookies } from 'quasar';
import { ActionTree } from 'vuex';
import http from '../../utils/http';
import { StateInterface } from '../index';
import { ScriptsStateInterface } from './state';

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
  fetchUserScriptList({ commit }, param:{uid:number, cookies: Cookies }) {
    return http.get<API.ScriptInfoResponse>('/user/scripts/' + param.uid.toString(), {
      headers: {
        cookie: 'token=' + (param.cookies ? param.cookies.get('token') : ''),
      },
    }).then(response => {
        commit('updateScripts', response.data);
      })
      .catch(error => {
        console.log(error);
        commit('updateScripts', { list: [], total: 0 });
      });
  },
  fetchScriptInfo({ commit }, param: { id: number, cookies: Cookies }) {
    return http.get<API.ScriptInfoResponse>('/scripts/' + param.id.toString(), {
      headers: {
        cookie: 'token=' + (param.cookies ? param.cookies.get('token') : ''),
      },
    }).then(response => {
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