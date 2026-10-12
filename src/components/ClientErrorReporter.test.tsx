/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ClientErrorReporter from './ClientErrorReporter';

const reportClientError = vi.hoisted(() => vi.fn());
vi.mock('@/lib/error-report/client', () => ({ reportClientError }));

afterEach(() => {
  cleanup();
  reportClientError.mockReset();
});

const dispatchRejection = (reason: unknown) => {
  const event = new Event('unhandledrejection');
  Object.assign(event, { reason });
  window.dispatchEvent(event);
};

describe('ClientErrorReporter', () => {
  it('reports uncaught exceptions with their stack and script url', () => {
    render(<ClientErrorReporter />);
    const error = new Error('boom');

    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'Uncaught Error: boom',
        filename: 'https://scriptcat.org/_next/static/chunks/x.js',
        error,
      }),
    );

    expect(reportClientError).toHaveBeenCalledWith({
      kind: 'uncaught',
      message: 'Uncaught Error: boom',
      stack: error.stack,
      source: 'https://scriptcat.org/_next/static/chunks/x.js',
    });
  });

  it('reports unhandled promise rejections', () => {
    render(<ClientErrorReporter />);
    const error = new Error('rejected');

    dispatchRejection(error);

    expect(reportClientError).toHaveBeenCalledWith({
      kind: 'rejection',
      message: 'rejected',
      stack: error.stack,
    });
  });

  it('names the failed request when an API call is rejected', () => {
    render(<ClientErrorReporter />);
    const error = Object.assign(new Error('请求超时'), {
      name: 'APIError',
      statusCode: -1,
      request: { method: 'GET', endpoint: '/scripts/1/state', duration: 20003 },
    });

    dispatchRejection(error);

    expect(reportClientError).toHaveBeenCalledWith({
      kind: 'rejection',
      message: '请求超时',
      stack: error.stack,
      detail: 'GET /scripts/1/state status=-1 20003ms',
    });
  });

  it('describes rejections whose reason is not an Error', () => {
    render(<ClientErrorReporter />);

    dispatchRejection('timeout');

    expect(reportClientError).toHaveBeenCalledWith({
      kind: 'rejection',
      message: 'timeout',
      stack: undefined,
    });
  });

  it('stops listening once unmounted', () => {
    const { unmount } = render(<ClientErrorReporter />);
    unmount();

    dispatchRejection(new Error('late'));

    expect(reportClientError).not.toHaveBeenCalled();
  });
});
