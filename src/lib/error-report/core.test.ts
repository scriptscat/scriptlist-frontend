import { describe, expect, it, vi } from 'vitest';
import {
  buildPayload,
  createReporter,
  generateErrorId,
  isControlFlowError,
  isPageTranslated,
  localeFromPath,
  requestDetail,
  sanitizeUrl,
  shouldIgnoreError,
} from './core';
import type { ClientErrorPayload, ReportContext } from './core';

const context: ReportContext = {
  pathname: '/en/script-show-page/8274',
  search: '',
  locale: 'en',
  build: 'prod.c6b88da',
  translated: false,
};

describe('sanitizeUrl', () => {
  it('keeps the path and ordinary query parameters', () => {
    expect(sanitizeUrl('/en/search', '?keyword=bilibili&page=2')).toBe(
      '/en/search?keyword=bilibili&page=2',
    );
  });

  it('returns the bare path when there is no query', () => {
    expect(sanitizeUrl('/en', '')).toBe('/en');
  });

  it.each(['code', 'token', 'state'])(
    'removes the value of the sensitive parameter %s',
    (name) => {
      const url = sanitizeUrl('/en/login/oauth', `?${name}=s3cret&next=%2Fen`);
      expect(url).not.toContain('s3cret');
      expect(url).toContain('next=%2Fen');
    },
  );

  it('drops the internal _rsc parameter', () => {
    expect(sanitizeUrl('/en/search', '?_rsc=abc123&sort=createtime')).toBe(
      '/en/search?sort=createtime',
    );
  });

  it('caps the result at 1000 characters', () => {
    expect(
      sanitizeUrl('/en/search', `?keyword=${'a'.repeat(2000)}`),
    ).toHaveLength(1000);
  });
});

describe('shouldIgnoreError', () => {
  it('ignores cross-origin "Script error."', () => {
    expect(shouldIgnoreError({ message: 'Script error.' })).toBe(true);
  });

  it.each([
    'chrome-extension://abcdef/content.js',
    'moz-extension://abcdef/content.js',
    'safari-web-extension://abcdef/content.js',
  ])('ignores errors thrown from a browser extension (%s)', (url) => {
    expect(
      shouldIgnoreError({
        message: 'boom',
        stack: `Error: boom\n    at ${url}:1:1`,
      }),
    ).toBe(true);
    expect(shouldIgnoreError({ message: 'boom', source: url })).toBe(true);
  });

  it('ignores ResizeObserver loop notices', () => {
    expect(
      shouldIgnoreError({
        message:
          'ResizeObserver loop completed with undelivered notifications.',
      }),
    ).toBe(true);
  });

  it('keeps errors from the site itself', () => {
    expect(
      shouldIgnoreError({
        message: "Failed to execute 'removeChild' on 'Node'",
        stack: 'at a (https://scriptcat.org/_next/static/chunks/x.js:1:2)',
      }),
    ).toBe(false);
  });
});

describe('isPageTranslated', () => {
  const doc = (classes: string[], hasEdgeMarker = false) => ({
    documentElement: {
      classList: { contains: (n: string) => classes.includes(n) },
    },
    querySelector: () => (hasEdgeMarker ? {} : null),
  });

  it('detects Chrome page translation', () => {
    expect(isPageTranslated(doc(['translated-ltr']))).toBe(true);
    expect(isPageTranslated(doc(['translated-rtl']))).toBe(true);
  });

  it('detects Edge page translation', () => {
    expect(isPageTranslated(doc([], true))).toBe(true);
  });

  it('is false for an untouched page', () => {
    expect(isPageTranslated(doc(['dark']))).toBe(false);
  });
});

describe('isControlFlowError', () => {
  it.each([
    'NEXT_REDIRECT;replace;/en/login;307;',
    'NEXT_NOT_FOUND',
    'NEXT_HTTP_ERROR_FALLBACK;404',
  ])('treats %s as navigation control flow', (digest) => {
    expect(isControlFlowError(Object.assign(new Error('x'), { digest }))).toBe(
      true,
    );
  });

  it('treats ordinary errors as errors', () => {
    expect(isControlFlowError(new Error('boom'))).toBe(false);
    expect(
      isControlFlowError(
        Object.assign(new Error('x'), { digest: '652515689' }),
      ),
    ).toBe(false);
  });
});

describe('buildPayload', () => {
  it('maps the input and the page context onto the request fields', () => {
    expect(
      buildPayload(
        {
          kind: 'boundary',
          message: 'boom',
          stack: 'at a',
          digest: '123',
          errorId: 'RF2T1JTN8',
        },
        { ...context, search: '?code=s3cret', translated: true },
      ),
    ).toEqual({
      kind: 'boundary',
      message: 'boom',
      stack: 'at a',
      digest: '123',
      error_id: 'RF2T1JTN8',
      url: '/en/script-show-page/8274?code=',
      locale: 'en',
      build: 'prod.c6b88da',
      translated: true,
    });
  });

  it('truncates every field to the limit the backend accepts', () => {
    const payload = buildPayload(
      {
        kind: 'uncaught',
        message: 'm'.repeat(5000),
        stack: 's'.repeat(20000),
        digest: 'd'.repeat(200),
        errorId: 'e'.repeat(200),
      },
      { ...context, locale: 'l'.repeat(50), build: 'b'.repeat(200) },
    );
    expect(payload.message).toHaveLength(1000);
    expect(payload.stack).toHaveLength(8000);
    expect(payload.digest).toHaveLength(64);
    expect(payload.error_id).toHaveLength(32);
    expect(payload.locale).toHaveLength(16);
    expect(payload.build).toHaveLength(64);
  });

  it('appends the detail to the message', () => {
    const payload = buildPayload(
      {
        kind: 'rejection',
        message: '请求超时',
        detail: 'GET /scripts/1 status=-1 20003ms',
      },
      context,
    );
    expect(payload.message).toBe('请求超时 [GET /scripts/1 status=-1 20003ms]');
  });

  it('never sends an empty message', () => {
    expect(
      buildPayload({ kind: 'rejection', message: '' }, context).message,
    ).not.toBe('');
  });
});

describe('requestDetail', () => {
  const apiError = (over: Record<string, unknown>) =>
    Object.assign(new Error('请求超时'), { name: 'APIError', ...over });

  it('describes the failed request: method, endpoint, status and duration', () => {
    const error = apiError({
      statusCode: -1,
      request: {
        method: 'GET',
        endpoint: '/scripts/8274/state',
        duration: 20003,
      },
    });
    expect(requestDetail(error)).toBe(
      'GET /scripts/8274/state status=-1 20003ms',
    );
  });

  it('adds the content type when the response was not JSON', () => {
    const error = apiError({
      statusCode: 502,
      request: {
        method: 'GET',
        endpoint: '/scripts/1',
        duration: 31,
        contentType: 'text/html',
      },
    });
    expect(requestDetail(error)).toBe(
      'GET /scripts/1 status=502 31ms content-type=text/html',
    );
  });

  it('is undefined for errors that did not come from a request', () => {
    expect(requestDetail(new Error('boom'))).toBeUndefined();
    expect(requestDetail('boom')).toBeUndefined();
    expect(requestDetail(null)).toBeUndefined();
  });
});

describe('createReporter', () => {
  const setup = (maxReports?: number) => {
    const sent: ClientErrorPayload[] = [];
    const report = createReporter({
      send: (p) => {
        sent.push(p);
      },
      getContext: () => context,
      maxReports,
    });
    return { sent, report };
  };

  it('sends a report for a new error', () => {
    const { sent, report } = setup();
    expect(report({ kind: 'uncaught', message: 'boom', stack: 'at a' })).toBe(
      true,
    );
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      kind: 'uncaught',
      message: 'boom',
      url: context.pathname,
    });
  });

  it('reports the same error only once per page load', () => {
    const { sent, report } = setup();
    report({ kind: 'uncaught', message: 'boom', stack: 'at a' });
    expect(report({ kind: 'boundary', message: 'boom', stack: 'at a' })).toBe(
      false,
    );
    expect(sent).toHaveLength(1);
  });

  it('treats the same error as a duplicate even when its detail differs', () => {
    const { report, sent } = setup();
    report({
      kind: 'rejection',
      message: '请求超时',
      detail: 'GET /a 20001ms',
    });
    report({
      kind: 'rejection',
      message: '请求超时',
      detail: 'GET /a 20007ms',
    });
    expect(sent).toHaveLength(1);
  });

  it('stops after five reports per page load', () => {
    const { sent, report } = setup();
    for (let i = 0; i < 8; i++) {
      report({ kind: 'uncaught', message: `boom ${i}` });
    }
    expect(sent).toHaveLength(5);
  });

  it('does not send ignored errors and does not count them', () => {
    const { sent, report } = setup(1);
    expect(report({ kind: 'uncaught', message: 'Script error.' })).toBe(false);
    expect(report({ kind: 'uncaught', message: 'real' })).toBe(true);
    expect(sent).toHaveLength(1);
  });

  it('never throws when sending fails', () => {
    const report = createReporter({
      send: () => {
        throw new Error('network down');
      },
      getContext: () => context,
    });
    expect(() => report({ kind: 'uncaught', message: 'boom' })).not.toThrow();
  });

  it('never throws when reading the page context fails', () => {
    const send = vi.fn();
    const report = createReporter({
      send,
      getContext: () => {
        throw new Error('no document');
      },
    });
    expect(() => report({ kind: 'uncaught', message: 'boom' })).not.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});

describe('generateErrorId', () => {
  it('produces a short uppercase id that fits the backend limit', () => {
    const id = generateErrorId();
    expect(id).toMatch(/^[0-9A-Z]{6,12}$/);
  });

  it('produces a different id each time', () => {
    expect(generateErrorId()).not.toBe(generateErrorId());
  });
});

describe('localeFromPath', () => {
  it.each([
    ['/en/script-show-page/8274', 'en'],
    ['/zh-CN', 'zh-CN'],
    ['/zh-TW/search', 'zh-TW'],
  ])('reads the locale prefix of %s', (pathname, locale) => {
    expect(localeFromPath(pathname)).toBe(locale);
  });

  it('is undefined when the path has no locale prefix', () => {
    expect(localeFromPath('/')).toBeUndefined();
    expect(localeFromPath('/script-show-page/8274')).toBeUndefined();
  });
});
