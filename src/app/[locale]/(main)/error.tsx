'use client';

import { useEffect, useState } from 'react';
import ErrorPage from '@/components/ErrorPage';
import { reportClientError } from '@/lib/error-report/client';
import { generateErrorId, requestDetail } from '@/lib/error-report/core';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 页面上显示的 ID 就是上报的 ID：用户截图里有它，就能在日志里搜到这次错误
  const [errorId] = useState(generateErrorId);

  useEffect(() => {
    // 记录错误到控制台
    console.error('Application error:', error);

    reportClientError({
      kind: 'boundary',
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      errorId,
      detail: requestDetail(error),
    });
  }, [error, errorId]);

  // 对于500类错误，显示专门的500错误页面
  return (
    <ErrorPage
      statusCode={500}
      error={error}
      errorId={errorId}
      showErrorDetails={true}
      showFeedback={true}
    />
  );
}
