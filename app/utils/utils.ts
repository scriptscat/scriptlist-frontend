import { format, formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useContext } from 'react';
import { UserContext } from '../context-manager';
import type { Script } from '~/services/scripts/types';

export function formatDate(value: number) {
  // 如果大于一年，显示年月日
  if (value * 1000 < new Date().getTime() - 365 * 24 * 60 * 60 * 1000) {
    return format(value * 1000, 'yyyy年MM月dd日');
  }
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

export function scriptName(script: Script) {
  return script.script.meta_json['name:zh-cn'] || script.name;
}

export function scriptDescription(script: Script) {
  return script.script.meta_json['description:zh-cn'] || script.description;
}
