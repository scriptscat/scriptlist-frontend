'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { GlobalConfig } from '@/lib/api/services/system';

const GlobalConfigContext = createContext<GlobalConfig | undefined>(undefined);

export function GlobalConfigProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: GlobalConfig;
}) {
  const value = useMemo(() => config, [config]);

  return (
    <GlobalConfigContext.Provider value={value}>
      {children}
    </GlobalConfigContext.Provider>
  );
}

export function useGlobalConfig(): GlobalConfig {
  const context = useContext(GlobalConfigContext);
  if (context === undefined) {
    throw new Error(
      'useGlobalConfig must be used within a GlobalConfigProvider',
    );
  }
  return context;
}
