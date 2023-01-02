import { createContext } from 'react';
import type { Script } from './services/scripts/types';
import type { Follow, User } from './services/users/types';

export type UserContextData = {
  user?: User;
  dark?: boolean;
  env?: {
    APP_API_URL: string;
    
  };
};

export const UserContext = createContext<UserContextData>({});

export type ScriptContextData = {
  script?: Script;
};

export const ScriptContext = createContext<ScriptContextData>({});
