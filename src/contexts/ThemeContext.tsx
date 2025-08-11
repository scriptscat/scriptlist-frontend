import React from 'react';
import { ThemeClientProvider } from './ThemeClientContext';
import type { ThemeMode } from '@/lib/cookies';

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode,
}) => {
  return (
    <ThemeClientProvider initialMode={initialMode}>
      {children}
    </ThemeClientProvider>
  );
};
