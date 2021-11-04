import { get } from "src/utils/axios";

export function loginUserInfo({ commit }, { cookies, res }) {
    if (!cookies.get('token')) {
        return;
    }
    return get("/user/info", {
        headers: {
            cookie: "token=" + cookies.get('token')
        }
    }).then(response => {
        if (response.headers['set-cookie']) {
            res.append("set-cookie", response.headers['set-cookie']);
        }
        if (response.data.code === 0) {
            commit("updateUser", { islogin: true, user: response.data.data.user });
        } else {
            commit("updateUser", { islogin: false });
        }
    })
        .catch(error => {
            console.log(error, "err");
            commit("updateUser", { islogin: false });
        });
}

export function fetchUserInfo({ commit }, uid) {
    return get("/user/info/" + uid).then(response => {
      if (response.data.code === 0) {
        commit("updateUser", { islogin: true, user: response.data.data.user });
      } else {
        commit("updateUser", {});
      }
    }).catch(error => {
      commit("updateUser", {});
    });
  
  }