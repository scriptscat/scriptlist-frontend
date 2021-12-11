import Http from 'src/utils/http';

export function Submit(uid: string,data:DTO.Comment) {
  return Http.put<API.CommontResponse>('/scripts/' + uid + '/score',data);
}

export function getallscroe(uid: string) {
  return Http.get<API.CommontListResponse>('/scripts/' + uid + '/score');
}

export function GetMyScore(uid: string) {
  return Http.get<API.CommontResponse>('/scripts/' + uid + '/score/self');
}
