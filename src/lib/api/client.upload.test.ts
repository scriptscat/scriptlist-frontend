import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { APIError } from '@/types/api';

// fetch 拿不到上传进度，apiClient.upload 走 XMLHttpRequest；这里用一个最小的假 XHR 驱动各分支。
class FakeXHR {
  static last: FakeXHR;
  method = '';
  url = '';
  body: unknown;
  withCredentials = false;
  timeout = 0;
  status = 0;
  responseText = '';
  upload: { onprogress: ((e: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;

  constructor() {
    FakeXHR.last = this;
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  send(body: unknown) {
    this.body = body;
  }

  progress(loaded: number, total: number) {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded,
      total,
    } as ProgressEvent);
  }

  respond(status: number, body: unknown) {
    this.status = status;
    this.responseText = typeof body === 'string' ? body : JSON.stringify(body);
    this.onload?.();
  }
}

describe('apiClient.upload', () => {
  beforeEach(() => {
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the form data with credentials and resolves the response data', async () => {
    const form = new FormData();
    form.append('comment', 'advertise');
    const p = apiClient.upload<{ id: string }>('/resource/image', form);

    const xhr = FakeXHR.last;
    expect(xhr.method).toBe('POST');
    expect(xhr.url.endsWith('/resource/image')).toBe(true);
    expect(xhr.withCredentials).toBe(true);
    expect(xhr.body).toBe(form);

    xhr.respond(200, { code: 0, msg: 'ok', data: { id: 'abc' } });
    await expect(p).resolves.toEqual({ id: 'abc' });
  });

  it('reports upload progress as a percentage', async () => {
    const onProgress = vi.fn();
    const p = apiClient.upload('/resource/image', new FormData(), {
      onProgress,
    });

    const xhr = FakeXHR.last;
    xhr.progress(0, 200);
    xhr.progress(50, 200);
    xhr.progress(200, 200);
    xhr.respond(200, { code: 0, msg: 'ok', data: {} });
    await p;

    expect(onProgress.mock.calls.map((c) => c[0])).toEqual([0, 25, 100]);
  });

  it('uses a longer timeout than regular API requests by default', () => {
    apiClient.upload('/resource/image', new FormData()).catch(() => {});
    expect(FakeXHR.last.timeout).toBeGreaterThan(20000);
  });

  it('rejects with the backend message on a non-zero business code', async () => {
    const p = apiClient.upload('/resource/image', new FormData());
    FakeXHR.last.respond(400, { code: 101001, msg: '图片过大', data: null });

    await expect(p).rejects.toMatchObject({
      statusCode: 400,
      code: 101001,
      msg: '图片过大',
    });
  });

  it('rejects with APIError when the response is not JSON', async () => {
    const p = apiClient.upload('/resource/image', new FormData());
    FakeXHR.last.respond(520, '<html>cloudflare</html>');

    await expect(p).rejects.toBeInstanceOf(APIError);
  });

  it('rejects with a timeout APIError', async () => {
    const p = apiClient.upload('/resource/image', new FormData());
    FakeXHR.last.ontimeout?.();

    await expect(p).rejects.toMatchObject({ msg: '请求超时' });
  });

  it('rejects with a network APIError', async () => {
    const p = apiClient.upload('/resource/image', new FormData());
    FakeXHR.last.onerror?.();

    await expect(p).rejects.toBeInstanceOf(APIError);
  });
});
