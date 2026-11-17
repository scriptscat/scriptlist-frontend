import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { APIError } from '@/types/api';

// 上报的请求失败要能归因到具体接口：APIError 需带上请求的方法、路径与耗时。
const catchError = async (promise: Promise<unknown>): Promise<APIError> => {
  try {
    await promise;
  } catch (error) {
    return error as APIError;
  }
  throw new Error('expected the request to fail');
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('apiClient request failures', () => {
  it('records which request timed out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.reject(
          Object.assign(new Error('aborted'), { name: 'AbortError' }),
        ),
      ),
    );

    const error = await catchError(
      apiClient.get('/scripts/8274/state', { keyword: 'secret' }),
    );

    expect(error).toBeInstanceOf(APIError);
    expect(error.message).toBe('请求超时');
    expect(error.request).toMatchObject({
      method: 'GET',
      endpoint: '/scripts/8274/state',
    });
    expect(error.request?.duration).toBeGreaterThanOrEqual(0);
  });

  it('records the request behind a network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    const error = await catchError(
      apiClient.post('/scripts/1/watch', { a: 1 }),
    );

    expect(error.message).toBe('网络错误: Failed to fetch');
    expect(error.request).toMatchObject({
      method: 'POST',
      endpoint: '/scripts/1/watch',
    });
  });

  it('records the status and content type of a non-JSON response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response('<html>502 Bad Gateway</html>', {
            status: 502,
            headers: { 'content-type': 'text/html' },
          }),
        ),
      ),
    );

    const error = await catchError(apiClient.get('/scripts/1'));

    expect(error.message).toBe('解析响应数据失败');
    expect(error.statusCode).toBe(502);
    expect(error.request).toMatchObject({
      method: 'GET',
      endpoint: '/scripts/1',
      contentType: 'text/html',
    });
  });

  it('strips a query string written into the endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    const error = await catchError(apiClient.get('/login/oauth?code=s3cret'));

    expect(error.request?.endpoint).toBe('/login/oauth');
  });
});
