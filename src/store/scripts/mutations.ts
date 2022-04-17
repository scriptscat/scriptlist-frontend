import { MutationTree } from 'vuex';
import { ScriptsStateInterface } from './state';

const mutation: MutationTree<ScriptsStateInterface> = {
  updateScripts(state, { list, total }) {
    state.scripts = list;
    // 处理bg类型脚本
    state.total = total;
  },
  updateScriptInfo(state, script: any) {
    state.script = script;
  },
  updateErrMsg(state, errMsg: string) {
    state.errMsg = errMsg;
  },
  updateScriptVersion(state, { list, total }) {
    state.version = list;
    state.total = total;
    state.preFetch = true;
  },
  resetPreFetch(state) {
    state.preFetch = false;
  },
};

export default mutation;
