import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildServerErrorReport, reportServerError } from './server';
import type { ServerRequestInfo } from './server';

const reportClientError = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api/services/system', () => ({
  systemService: { reportClientError },
}));

const request = (over: Partial<ServerRequestInfo> = {}): ServerRequestInfo => ({
  path: '/en/script-show-page/2429/manage',
  method: 'GET',
  headers: {},
  ...over,
});

afterEach(() => {
  reportClientError.mockReset();
});

describe('buildServerErrorReport', () => {
  it('reports the real message, stack and digest of a render error', () => {
    const error = Object.assign(new Error('用户不允许操作'), {
      digest: '652515689',
    });
    const report = buildServerErrorReport(error, request());
    expect(report?.payload).toMatchObject({
      kind: 'ssr',
      message: '用户不允许操作',
      digest: '652515689',
      url: '/en/script-show-page/2429/manage',
      locale: 'en',
    });
    expect(report?.payload.stack).toContain('用户不允许操作');
  });

  it('names the backend request that failed during rendering', () => {
    const error = Object.assign(new Error('请求超时'), {
      name: 'APIError',
      statusCode: -1,
      request: { method: 'GET', endpoint: '/scripts', duration: 20004 },
    });
    const report = buildServerErrorReport(
      error,
      request({ path: '/zh-CN/search?keyword=x' }),
    );
    expect(report?.payload.message).toBe(
      '请求超时 [GET /scripts status=-1 20004ms]',
    );
  });

  it('keeps the query string but not the sensitive or internal parameters', () => {
    const report = buildServerErrorReport(
      new Error('boom'),
      request({ path: '/zh-CN/search?keyword=x&_rsc=abc&token=s3cret' }),
    );
    expect(report?.payload.url).toBe('/zh-CN/search?keyword=x&token=');
    expect(report?.payload.locale).toBe('zh-CN');
  });

  it('leaves the locale empty when the path has no locale prefix', () => {
    const report = buildServerErrorReport(
      new Error('boom'),
      request({ path: '/' }),
    );
    expect(report?.payload.locale).toBeUndefined();
  });

  it('describes thrown values that are not Error objects', () => {
    const report = buildServerErrorReport('plain failure', request());
    expect(report?.payload.message).toBe('plain failure');
  });

  it.each(['NEXT_NOT_FOUND', 'NEXT_REDIRECT;replace;/en/login;307;'])(
    'does not report navigation control flow (%s)',
    (digest) => {
      const error = Object.assign(new Error('x'), { digest });
      expect(buildServerErrorReport(error, request())).toBeNull();
    },
  );

  // 「脚本不存在 / 已删除 / 未登录」是页面抛出的预期结果，后端自己有记录，
  // 报上来只会把真正的故障淹没（上线首日占了全部上报的四成）。
  it.each([400, 401, 403, 404, 429])(
    'does not report an expected API error (HTTP %i)',
    (statusCode) => {
      const error = Object.assign(new Error('脚本不存在'), {
        name: 'APIError',
        statusCode,
        code: 101004,
      });
      expect(buildServerErrorReport(error, request())).toBeNull();
    },
  );

  it.each([
    ['a backend failure', 500],
    ['a timeout or network error', -1],
  ])('still reports an API error that is %s', (_label, statusCode) => {
    const error = Object.assign(new Error('请求超时'), {
      name: 'APIError',
      statusCode,
      code: 0,
    });
    expect(buildServerErrorReport(error, request())?.payload.message).toBe(
      '请求超时',
    );
  });

  it('still reports ordinary errors that happen to carry a 4xx-looking field', () => {
    const error = Object.assign(new Error('boom'), { statusCode: 404 });
    expect(buildServerErrorReport(error, request())).not.toBeNull();
  });

  it('does not report a visitor closing the connection mid-render', () => {
    expect(
      buildServerErrorReport(
        new Error('The destination stream closed early.'),
        request(),
      ),
    ).toBeNull();
  });

  it('forwards the visitor identity so the backend attributes the report to them', () => {
    const report = buildServerErrorReport(
      new Error('boom'),
      request({
        headers: {
          cookie: 'login_id=a; token=b',
          'x-forwarded-for': '203.0.113.7, 10.42.0.1',
          'x-real-ip': '203.0.113.7',
          'user-agent': 'Mozilla/5.0',
          accept: 'text/html',
        },
      }),
    );
    expect(report?.headers).toEqual({
      Cookie: 'login_id=a; token=b',
      'X-Forwarded-For': '203.0.113.7, 10.42.0.1',
      'X-Real-IP': '203.0.113.7',
      'User-Agent': 'Mozilla/5.0',
    });
  });

  it('omits identity headers the request did not carry', () => {
    const report = buildServerErrorReport(new Error('boom'), request());
    expect(report?.headers).toEqual({});
  });
});

describe('reportServerError', () => {
  it('sends the report with the forwarded headers', async () => {
    reportClientError.mockResolvedValue({});
    await reportServerError(
      new Error('boom'),
      request({ headers: { 'user-agent': 'Mozilla/5.0' } }),
    );
    expect(reportClientError).toHaveBeenCalledTimes(1);
    const [payload, options] = reportClientError.mock.calls[0];
    expect(payload).toMatchObject({ kind: 'ssr', message: 'boom' });
    expect(options.headers).toEqual({ 'User-Agent': 'Mozilla/5.0' });
  });

  it('does not send navigation control flow', async () => {
    await reportServerError(
      Object.assign(new Error('x'), { digest: 'NEXT_NOT_FOUND' }),
      request(),
    );
    expect(reportClientError).not.toHaveBeenCalled();
  });

  it('swallows a failing report', async () => {
    reportClientError.mockRejectedValue(new Error('backend down'));
    await expect(
      reportServerError(new Error('boom'), request()),
    ).resolves.toBeUndefined();
  });
});
