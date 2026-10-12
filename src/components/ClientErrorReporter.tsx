'use client';

import { useEffect } from 'react';
import { reportClientError } from '@/lib/error-report/client';
import { requestDetail } from '@/lib/error-report/core';

/**
 * 上报错误边界接不到的浏览器端错误：事件回调、定时器、异步流程里抛出的异常。
 */
export default function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientError({
        kind: 'uncaught',
        message: event.message || String(event.error),
        stack: event.error instanceof Error ? event.error.stack : undefined,
        source: event.filename,
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const { reason } = event;
      reportClientError({
        kind: 'rejection',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        detail: requestDetail(reason),
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
