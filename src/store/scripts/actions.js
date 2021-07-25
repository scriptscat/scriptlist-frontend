import { get } from "src/utils/axios";

export function fetchScriptList({ commit }, url) {
    return get(url).then(response => {
        commit("updateScripts", response.data);
    })
        .catch(error => {
            commit("updateScripts", { list: [], total: 0 });
        });
}
