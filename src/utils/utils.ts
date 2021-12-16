import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale'

export function formatDate(value: number | Date) {
	return formatDistance(value, new Date(), { addSuffix: true, locale: zhCN });
}