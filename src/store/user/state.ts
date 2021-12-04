export interface UserStateInterface {
  islogin: boolean
  user?: DTO.User
  userInfo?: DTO.User
}

function state(): UserStateInterface {
  return {
    islogin: false,
    user: undefined,
    userInfo: undefined,
  }
};

export default state;
