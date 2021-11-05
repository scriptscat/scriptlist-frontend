
export function updateUser(state, { islogin, user }) {
    state.islogin = islogin;
    state.user = user;
}

export function fetchUserInfo(state,{ userInfo}) {
    state.userInfo = userInfo;
}