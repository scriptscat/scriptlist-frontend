import { get } from "src/utils/axios";

export function fetchScriptList({ commit }, url) {
  return get(url)
    .then(response => {
      commit("updateScripts", response.data);
    })
    .catch(error => {
      commit("updateScripts", { list: [], total: 0 });
    });
}

export function fetchScriptInfo({ commit }, id) {
  return get("/scripts/" + id).then(response => {
    if (response.data.code === 0) {
      commit("updateScriptInfo", response.data.data);
    } else {
      commit("updateScriptInfo", {});
    }
  }).catch(error => {
    commit("updateScriptInfo", {});
  });
}
