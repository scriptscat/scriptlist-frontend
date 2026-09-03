import type { ReactNode } from 'react';
// 深层导入：服务端组件若从 'antd' barrel 具名导入，整个 barrel 会变成客户端引用。
import Result from 'antd/es/result';
import { getTranslations } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import { userService } from '@/lib/api';
import AdminLayout from './components/AdminLayout';
export { noindexMetadata as metadata } from '@/lib/seo/robots';

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
      <AdminLayout>{children}</AdminLayout>
    </PageIntlProvider>
  );
}
