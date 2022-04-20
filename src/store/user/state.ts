export interface UserStateInterface {
  islogin: boolean;
  user?: DTO.User;
  userInfo: DTO.User;
  follow: DTO.Follow;
}

function state(): UserStateInterface {
  return {
    islogin: false,
    user: undefined,
    userInfo: <DTO.User>{},
    follow: <DTO.Follow>{},
  };
}

export default state;
