/**
 * 错误处理工具函数
 */

/**
 * 生成错误ID
 */
export function generateErrorId(): string {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

/**
 * 格式化错误时间
 */
export function formatErrorTime(): string {
  return new Date().toLocaleString('zh-CN');
}

/**
 * 记录错误信息
 */
export function logError(error: Error, context?: Record<string, any>) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: formatErrorTime(),
    context,
  };

  console.error('Application Error:', errorInfo);

  // 这里可以添加错误上报逻辑
  // 例如发送到 Sentry、LogRocket 等错误监控服务

  return errorInfo;
}

/**
 * 创建错误反馈邮件链接
 */
export function createFeedbackMailto(
  errorCode: number,
  errorId: string,
  errorTime: string,
): string {
  const subject = encodeURIComponent(`${errorCode}错误反馈`);
  const body = encodeURIComponent(
    `错误代码: ${errorCode}\n错误ID: ${errorId}\n错误时间: ${errorTime}\n\n请描述您遇到的问题：`,
  );
  return `mailto:admin@scriptcat.org?subject=${subject}&body=${body}`;
}

/**
 * 错误类型判断
 */
export function getErrorType(
  error: Error,
): 'network' | 'client' | 'server' | 'unknown' {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'network';
  }
  if (error.name === 'SyntaxError') {
    return 'client';
  }
  if (error.message.includes('Internal Server Error')) {
    return 'server';
  }
  return 'unknown';
}

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyErrorMessage(
  error: Error,
  locale: string = 'zh-CN',
): string {
  const errorType = getErrorType(error);

  const messages = {
    'zh-CN': {
      network: '网络连接出现问题，请检查您的网络设置',
      client: '页面加载出现问题，请尝试刷新页面',
      server: '服务器暂时无法响应，请稍后重试',
      unknown: '出现了未知错误，请联系技术支持',
    },
    'en-US': {
      network: 'Network connection issue, please check your network settings',
      client: 'Page loading issue, please try refreshing the page',
      server: 'Server temporarily unavailable, please try again later',
      unknown: 'An unknown error occurred, please contact technical support',
    },
  };

  return (
    messages[locale as keyof typeof messages]?.[errorType] ||
    messages['en-US'][errorType]
  );
}
