import { get } from "src/utils/axios";

export function loginUserInfo({ commit }, cookie, resp) {
    if (!cookie.get('auth')) {
        return;
    }
    return get("/user/info", {
        headers: {
            cookie: "auth=" + cookie.get('auth')
        }
    }).then(response => {
        if (response.headers['set-cookie']) {
            resp.setHeader("set-cookie", response.headers['set-cookie']);
        }
        if (response.data.code === 0) {
            commit("updateUser", { islogin: true, user: response.data.data.user });
        } else {
            commit("updateUser", { islogin: false });
        }
    })
        .catch(error => {
            commit("updateUser", { islogin: false });
        });
}
