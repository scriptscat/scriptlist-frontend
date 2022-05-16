import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(value: number) {
  return formatDistance(value * 1000, new Date(), {
    addSuffix: true,
    locale: zhCN,
  });
}
