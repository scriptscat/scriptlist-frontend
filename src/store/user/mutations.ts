import { MutationTree } from 'vuex';
import { UserStateInterface } from './state';

const mutation: MutationTree<UserStateInterface> = {
  updateUser(state, { islogin, user }) {
    state.islogin = islogin;
    state.user = user;
  }, fetchUserInfo(state, { userInfo, follow }) {
    state.userInfo = userInfo;
    state.follow = follow;
  }
};

export default mutation;
