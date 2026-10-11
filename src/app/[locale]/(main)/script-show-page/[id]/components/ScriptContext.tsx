'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { ScriptInfoMeta, ScriptState } from '../types';
import { WatchLevel } from '../types';

interface ScriptContextType {
  // 脚本被删除后举报详情仍会渲染（后端 /scripts/:id 一律 404），此时没有脚本信息。
  // 见 script-show-page/[id]/layout.tsx 的 404 分支。
  script?: ScriptInfoMeta;
  scriptState?: ScriptState;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

interface ScriptProviderProps {
  children: React.ReactNode;
  script?: ScriptInfoMeta;
  scriptState?: ScriptState;
}

export function ScriptProvider({
  children,
  script,
  scriptState,
}: ScriptProviderProps) {
  const value = useMemo(() => ({ script, scriptState }), [script, scriptState]);

  return (
    <ScriptContext.Provider value={value}>{children}</ScriptContext.Provider>
  );
}

/**
 * 给「一定拿得到脚本」的页面用：拿不到就直接抛，省得每个组件都写 `script?.`。
 * 脚本可能缺失的路由（已删除脚本的举报详情）请用 useScriptOptional。
 */
export function useScript() {
  const context = useScriptOptional();
  if (context.script === undefined) {
    throw new Error(
      'useScript requires a script; use useScriptOptional on routes that render without one',
    );
  }
  return context as ScriptContextType & { script: ScriptInfoMeta };
}

/**
 * 脚本可能不存在（已删除）时用这个，script 为 undefined 不算错误。
 */
export function useScriptOptional() {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScriptOptional must be used within a ScriptProvider');
  }
  return context;
}

export function useScriptState() {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScriptState must be used within a ScriptProvider');
  }
  return (
    context.scriptState || {
      watch: WatchLevel.NONE,
      favorite_ids: [],
      watch_count: 0,
      favorite_count: 0,
      issue_count: 0,
      report_count: 0,
    }
  );
}
