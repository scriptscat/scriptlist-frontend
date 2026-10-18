/** @vitest-environment jsdom */
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatSemDateTime, useSemDateTime } from './semdate';

// 线上 React #418 的复现：服务端（UTC）渲染出的时间文本，与访客浏览器
// （别的时区、晚一些的时钟）水合时算出来的不一样。
const SERVER_NOW = new Date('2026-10-12T06:00:00Z');
// UTC 是 2023-11-26，东八区已经是 27 日
const OLD = Date.UTC(2023, 10, 26, 16, 30) / 1000;
// 距服务端渲染 30 小时
const RECENT = SERVER_NOW.getTime() / 1000 - 30 * 3600;

function Times({ times }: { times: number[] }) {
  const format = useSemDateTime();
  return (
    <ul>
      {times.map((time) => (
        <li key={time}>{format(time)}</li>
      ))}
    </ul>
  );
}

const app = (times: number[]) => (
  <NextIntlClientProvider
    locale="zh-CN"
    timeZone="UTC"
    now={SERVER_NOW}
    messages={{ utils: { time_format: 'YYYY年MM月DD日' } }}
  >
    <Times times={times} />
  </NextIntlClientProvider>
);

const originalTZ = process.env.TZ;

const hydrate = async (html: string, times: number[]) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  const recoverable: unknown[] = [];
  await act(async () => {
    hydrateRoot(container, app(times), {
      onRecoverableError: (error) => recoverable.push(error),
    });
  });
  return {
    recoverable,
    texts: [...container.querySelectorAll('li')].map((li) => li.textContent),
  };
};

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(SERVER_NOW);
  process.env.TZ = 'UTC';
});

afterEach(() => {
  vi.useRealTimers();
  process.env.TZ = originalTZ;
  document.body.innerHTML = '';
});

describe('useSemDateTime hydration', () => {
  it('hydrates without a mismatch in a browser whose timezone differs from the server', async () => {
    const html = renderToString(app([OLD]));
    expect(html).toContain('2023年11月26日');

    process.env.TZ = 'Asia/Shanghai';
    const { recoverable, texts } = await hydrate(html, [OLD]);

    expect(recoverable).toEqual([]);
    // 水合完成后换成访客本地时区的日期
    expect(texts).toEqual(['2023年11月27日']);
  });

  it('hydrates without a mismatch when the page is rendered long after the server responded', async () => {
    const html = renderToString(app([RECENT]));
    expect(html).toContain('1 天前');

    // 爬虫常常拿到 HTML 很久之后才执行脚本
    vi.setSystemTime(new Date(SERVER_NOW.getTime() + 30 * 3600 * 1000));
    const { recoverable, texts } = await hydrate(html, [RECENT]);

    expect(recoverable).toEqual([]);
    expect(texts).toEqual(['3 天前']);
  });
});

describe('formatSemDateTime', () => {
  const now = SERVER_NOW.getTime() / 1000;

  it('shows the calendar date for times more than a year old, in the given timezone', () => {
    const base = { now, timeFormat: 'YYYY-MM-DD', locale: 'en' };
    expect(formatSemDateTime(OLD, { ...base, timeZone: 'UTC' })).toBe(
      '2023-11-26',
    );
    expect(formatSemDateTime(OLD, { ...base, timeZone: 'Asia/Shanghai' })).toBe(
      '2023-11-27',
    );
  });

  it('shows recent times relative to the given moment, in the given language', () => {
    const base = { now, timeFormat: 'YYYY-MM-DD' };
    expect(formatSemDateTime(RECENT, { ...base, locale: 'en' })).toBe(
      'a day ago',
    );
    expect(formatSemDateTime(RECENT, { ...base, locale: 'de' })).toBe(
      'vor einem Tag',
    );
  });
});
