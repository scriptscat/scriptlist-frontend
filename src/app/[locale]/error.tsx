'use client';

import { useEffect, useMemo } from 'react';
import ErrorPage from '@/components/ErrorPage';
import { APIError } from '@/types/api';

/**
 * 类型保护函数：检查错误是否为APIError
 */
function isAPIError(error: Error): APIError | false {
  if (error.name === 'APIError') {
    const json = JSON.parse(error.message);
    const { statusCode, code, msg, data } = json;
    return new APIError(statusCode, code, msg, data);
  }
  return false;
}

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isApiError = isAPIError(error);

  const statusCode = useMemo(() => {
    return isApiError ? isApiError.statusCode : 500;
  }, [isApiError]);

  useEffect(() => {
    // 记录错误到控制台
    console.error('Application error:', error);

    // 这里可以添加错误上报逻辑
    // 例如发送到错误监控服务
  }, [error]);

  // 对于500类错误，显示专门的500错误页面
  return (
    <ErrorPage
      statusCode={statusCode}
      error={error}
      showErrorDetails={statusCode === 500}
      showFeedback={statusCode === 500}
    />
  );
}
