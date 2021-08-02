
export function updateScripts(state, { list, total }) {
    state.scripts = list;
    // 处理bg类型脚本
    state.total = total;
}


export function updateScriptInfo(state, script) {
    state.script = script;
}
