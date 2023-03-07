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

// 分割数字 例如 1000=>1,000
export function splitNumber(num: string): string {
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function unixToTime(unix: number) {
  const date = new Date(unix * 1000);
  return date.toLocaleString();
}

// 秒转化为几分钟:几秒,并填充0
export function secondToMinute(second: number) {
  if (!second) {
    return '00:00';
  }
  const minute = Math.floor(second / 60);
  const s = second % 60;
  return `${minute < 10 ? '0' + minute : minute}:${s < 10 ? '0' + s : s}`;
}
