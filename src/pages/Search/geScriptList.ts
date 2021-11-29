import Http from 'src/utils/http';

function geScriptList() {
  function getRecommendList(url: string) {
    return Http.get(url)
  }

  function geAllScript(url: string) {
    return Http.get(url)
  }

  return {
    getRecommendList,
    geAllScript,
  };
}

export default geScriptList();