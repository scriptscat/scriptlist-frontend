import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useContext } from 'react';
import { UserContext } from '../context-manager';

export function formatDate(value: number) {
  return formatDistance(value * 1000, new Date(), {
    addSuffix: true,
    locale: zhCN,
  });
}
export function useDark() {
  const user = useContext(UserContext);
  return user.dark;
}
