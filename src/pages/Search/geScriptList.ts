import Http from 'src/utils/http';

interface ScriptListResponse {
  list: any
  code: number
}

function geScriptList() {
  function getRecommendList(url: string) {
    return Http.get<ScriptListResponse>(url)
  }

  function geAllScript(url: string) {
    return Http.get<ScriptListResponse>(url)
  }

  return {
    getRecommendList,
    geAllScript,
  };
}

export default geScriptList();