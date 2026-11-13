import { describe, expect, it } from 'vitest';
import {
  formatBanFullTime,
  getBanRemaining,
  getBanUntilParts,
} from './banTime';

// 「现在」= 2026-11-13 15:00（东八区）
const NOW = Date.UTC(2026, 10, 13, 7, 0) / 1000;
const SH = 'Asia/Shanghai';
/** 东八区的某个时刻 → unix 秒 */
const sh = (y: number, m: number, d: number, h: number, min = 0) =>
  Date.UTC(y, m - 1, d, h - 8, min) / 1000;

describe('getBanUntilParts', () => {
  const opts = { now: NOW, locale: 'zh-CN', timeZone: SH };

  it('今天解除只给时分', () => {
    expect(getBanUntilParts(sh(2026, 11, 13, 20), opts)).toEqual({
      kind: 'today',
      time: '20:00',
    });
  });

  it('明天解除只给时分', () => {
    expect(getBanUntilParts(sh(2026, 11, 14, 9), opts)).toEqual({
      kind: 'tomorrow',
      time: '09:00',
    });
  });

  it('今年内其他日期给月日和时分', () => {
    expect(getBanUntilParts(sh(2026, 11, 20, 14, 30), opts)).toEqual({
      kind: 'date',
      text: '11月20日 14:30',
    });
  });

  it('跨年只给年月日', () => {
    expect(getBanUntilParts(sh(2027, 1, 5, 10), opts)).toEqual({
      kind: 'date',
      text: '2027年1月5日',
    });
  });

  it('按传入时区判断今天/明天', () => {
    // UTC 11-13 17:30 = 东八区 11-14 01:30
    const t = Date.UTC(2026, 10, 13, 17, 30) / 1000;
    expect(getBanUntilParts(t, { ...opts, timeZone: 'UTC' })).toEqual({
      kind: 'today',
      time: '17:30',
    });
    expect(getBanUntilParts(t, opts)).toEqual({
      kind: 'tomorrow',
      time: '01:30',
    });
  });

  it('按语言输出日期', () => {
    expect(
      getBanUntilParts(sh(2026, 11, 20, 14, 30), { ...opts, locale: 'en' }),
    ).toEqual({ kind: 'date', text: 'Nov 20, 14:30' });
  });
});

describe('getBanRemaining', () => {
  const h = 3600;
  it('超过 1 天按天向下取整', () => {
    expect(getBanRemaining(NOW + 6 * 86400 + 23 * h, NOW)).toEqual({
      unit: 'day',
      count: 6,
    });
  });
  it('正好 1 天', () => {
    expect(getBanRemaining(NOW + 86400, NOW)).toEqual({
      unit: 'day',
      count: 1,
    });
  });
  it('不足 1 天按小时向下取整', () => {
    expect(getBanRemaining(NOW + 23 * h + 59 * 60, NOW)).toEqual({
      unit: 'hour',
      count: 23,
    });
  });
  it('不足 1 小时', () => {
    expect(getBanRemaining(NOW + 59 * 60, NOW)).toEqual({ unit: 'lt_hour' });
  });
  it('已过期也按不足 1 小时处理', () => {
    expect(getBanRemaining(NOW - 60, NOW)).toEqual({ unit: 'lt_hour' });
  });
});

describe('formatBanFullTime', () => {
  it('输出完整日期时间', () => {
    expect(formatBanFullTime(sh(2026, 11, 20, 14, 30), SH)).toBe(
      '2026-11-20 14:30',
    );
  });
});
