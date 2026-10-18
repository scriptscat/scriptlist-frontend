/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import ErrorBoundaryPage from './error';

const reportClientError = vi.hoisted(() => vi.fn());
vi.mock('@/lib/error-report/client', () => ({ reportClientError }));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// antd 的响应式组件会订阅断点，jsdom 没有实现 matchMedia。
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  reportClientError.mockReset();
  vi.restoreAllMocks();
});

describe('route error boundary', () => {
  it('reports the crash and shows the same error id it reported', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = Object.assign(new Error('removeChild failed'), {
      digest: '652515689',
    });

    render(<ErrorBoundaryPage error={error} reset={() => {}} />);

    expect(reportClientError).toHaveBeenCalledTimes(1);
    const report = reportClientError.mock.calls[0][0];
    expect(report).toMatchObject({
      kind: 'boundary',
      message: 'removeChild failed',
      digest: '652515689',
    });
    expect(report.stack).toBe(error.stack);
    expect(report.errorId).toMatch(/^[0-9A-Z]{6,12}$/);
    // 用户截图里的 ID 必须能在日志里搜到
    expect(screen.getByText(new RegExp(report.errorId))).toBeInTheDocument();
  });

  it('names the failed request when an API call crashed the page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = Object.assign(new Error('network error'), {
      name: 'APIError',
      statusCode: -1,
      request: { method: 'GET', endpoint: '/scripts', duration: 12 },
    });

    render(<ErrorBoundaryPage error={error} reset={() => {}} />);

    expect(reportClientError.mock.calls[0][0]).toMatchObject({
      kind: 'boundary',
      message: 'network error',
      detail: 'GET /scripts status=-1 12ms',
    });
  });
});
