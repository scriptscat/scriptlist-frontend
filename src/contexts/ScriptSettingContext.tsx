'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { ScriptSetting } from '@/app/[locale]/script-show-page/[id]/types';

interface ScriptSettingContextType {
  scriptSetting: ScriptSetting;
}

const ScriptSettingContext = createContext<
  ScriptSettingContextType | undefined
>(undefined);

interface ScriptSettingProviderProps {
  children: ReactNode;
  scriptSetting: ScriptSetting;
}

export function ScriptSettingProvider({
  children,
  scriptSetting,
}: ScriptSettingProviderProps) {
  const value = useMemo(() => ({ scriptSetting }), [scriptSetting]);

  return (
    <ScriptSettingContext.Provider value={value}>
      {children}
    </ScriptSettingContext.Provider>
  );
}

export function useScriptSetting() {
  const context = useContext(ScriptSettingContext);
  if (context === undefined) {
    throw new Error(
      'useScriptSetting must be used within a ScriptSettingProvider',
    );
  }
  return context;
}
