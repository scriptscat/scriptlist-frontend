import Http from 'src/utils/http';

export function submitComment(uid: string, data: DTO.Comment) {
  return Http.put<API.CommontResponse>('/scripts/' + uid + '/score', data);
}

export function getAllScroe(uid: string, page: number, count: number) {
  return Http.get<API.CommontListResponse>('/scripts/' + uid + '/score?page=' + page.toString() + '&count=' + count.toString());
}

export function getMyScore(uid: string) {
  return Http.get<API.CommontResponse>('/scripts/' + uid + '/score/self');
}
