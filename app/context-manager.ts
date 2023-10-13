import { createContext } from 'react';
import type { Script } from './services/scripts/types';
import type { User } from './services/users/types';

export type UserContextData = {
  user?: User;
  dark?: boolean;
  darkMode?: 'light' | 'dark' | 'auto';
  env?: {
    APP_API_URL: string;
  };
};

export const UserContext = createContext<UserContextData>({});

export type ScriptContextData = {
  script?: Script;
};

export const ScriptContext = createContext<ScriptContextData>({});
