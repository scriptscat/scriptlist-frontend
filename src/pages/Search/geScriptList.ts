import Http from 'src/utils/http';

// interface aa {
//   code: number;
//   list: Array<number>;
//   msg: string;
// }

function geScriptList() {
  function getRecommendList(url: string) {
    return Http.get(url)
  }

  return {
    getRecommendList,
  };
}

export default geScriptList();