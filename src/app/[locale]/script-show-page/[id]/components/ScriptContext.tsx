'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { ScriptInfoMeta, ScriptState } from '../types';
import { WatchLevel } from '../types';

interface ScriptContextType {
  script: ScriptInfoMeta;
  scriptState?: ScriptState;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

interface ScriptProviderProps {
  children: React.ReactNode;
  script: ScriptInfoMeta;
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

export function useScript() {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScript must be used within a ScriptProvider');
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
    }
  );
}
