'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { setDayjsLocale } from '@/lib/utils/dayjs-config';

/**
 * dayjs 语言环境初始化组件
 * 用于在客户端根据当前语言环境初始化 dayjs
 */
export function DayjsLocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  setDayjsLocale(locale);

  useEffect(() => {
    // 当语言环境变化时，更新 dayjs 的语言设置
    setDayjsLocale(locale);
  }, [locale]);

  return <>{children}</>;
}
