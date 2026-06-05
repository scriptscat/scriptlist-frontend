import type { ReactNode } from 'react';
import { Result } from 'antd';
import { getTranslations } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import { userService } from '@/lib/api';
import AdminRootLayoutClient from './components/AdminRootLayoutClient';

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await userService.getCurrentUser();

  if (!user || user.is_admin < 1) {
    const t = await getTranslations('admin');

    return (
      <PageIntlProvider namespaces={['admin', 'script']}>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Result status="403" title="403" subTitle={t('no_permission')} />
        </div>
      </PageIntlProvider>
    );
  }

  return (
    <PageIntlProvider namespaces={['admin', 'script']}>
      <AdminRootLayoutClient>{children}</AdminRootLayoutClient>
    </PageIntlProvider>
  );
}
