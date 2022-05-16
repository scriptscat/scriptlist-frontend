import { createContext } from 'react';
import { Follow, User } from './services/users/types';

export const UserContext = createContext<{
  user: { user: User; follow: Follow } | undefined;
}>({ user: undefined });
