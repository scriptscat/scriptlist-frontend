import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { Cookies } from 'quasar';
import http from 'src/utils/http';
import { UserStateInterface } from './state';

const actions: ActionTree<UserStateInterface, StateInterface> = {
  loginUserInfo({ commit }, param: { cookies: Cookies; res: Response }) {
    if (!param.cookies.get('token')) {
      return new Promise((resolve) => {
        resolve(undefined);
      });
    }
    return http
      .get<API.UserInfoResponse>('/user/info', {
        headers: {
          cookie: 'token=' + param.cookies.get('token'),
        },
      })
      .then((response) => {
        const headers: ResponseHeaders = response.headers;
        if (headers['set-cookie']) {
          param.res.headers.append('set-cookie', headers['set-cookie']);
        }
        if (response.data.code === 0) {
          commit('updateUser', {
            islogin: true,
            user: response.data.data.user,
          });
        } else {
          commit('updateUser', { islogin: false });
        }
      })
      .catch((error) => {
        console.log(error, 'loginUserInfo');
        commit('updateUser', { islogin: false });
      });
  },
  fetchUserInfo({ commit }, param: { uid: number; cookies?: Cookies }) {
    return http
      .get<API.UserInfoResponse>('/user/info/' + param.uid.toString(), {
        headers: {
          cookie: 'token=' + (param.cookies ? param.cookies.get('token') : ''),
        },
      })
      .then((response) => {
        if (response.data.code === 0) {
          commit('fetchUserInfo', { userInfo: response.data.data.user });
        } else {
          commit('fetchUserInfo', {});
        }
      })
      .catch((error) => {
        console.log(error, 'fetchUserInfo');
        commit('fetchUserInfo', {});
      });
  },
};

export default actions;
