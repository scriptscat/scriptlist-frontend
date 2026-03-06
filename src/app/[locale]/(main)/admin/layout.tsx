import type { ReactNode } from 'react';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import AdminRootLayoutClient from './components/AdminRootLayoutClient';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <PageIntlProvider namespaces={['admin']}>
      <AdminRootLayoutClient>{children}</AdminRootLayoutClient>
    </PageIntlProvider>
  );
}
