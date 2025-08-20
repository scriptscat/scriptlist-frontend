'use client';

import { useEffect } from 'react';
import ErrorPage from '@/components/ErrorPage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === 'development') {
    throw error;
  }

  useEffect(() => {
    // 记录错误到控制台
    console.error('Application error:', error);

    // 这里可以添加错误上报逻辑
    // 例如发送到错误监控服务
  }, [error]);

  // 对于500类错误，显示专门的500错误页面
  return (
    <ErrorPage
      statusCode={500}
      error={error}
      showErrorDetails={true}
      showFeedback={true}
    />
  );
}
