'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
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
  return (
    <ScriptSettingContext.Provider value={{ scriptSetting }}>
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
