import { MutationTree } from 'vuex';
import { ScriptsStateInterface } from './state';

const mutation: MutationTree<ScriptsStateInterface> = {
  updateScripts(state, { list, total }) {
    state.scripts = list;
    // 处理bg类型脚本
    state.total = total;
  }, updateScriptInfo(state, script: any) {
    state.script = script;
  }, SetIsManagerScript(state, status) {
    state.is_manager = status;
  }
};

export default mutation;
