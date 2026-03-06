'use client';

import type { ReactNode } from 'react';
import { Result } from 'antd';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from 'next-intl';
import AdminLayout from './AdminLayout';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const t = useTranslations('admin');

  if (!user || user.is_admin < 1) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Result status="403" title="403" subTitle={t('no_permission')} />
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
