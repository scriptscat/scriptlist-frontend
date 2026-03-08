import AuthLayout from '@/components/layout/AuthLayout';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageIntlProvider namespaces={['auth', 'login', 'layout']}>
      <AuthLayout>{children}</AuthLayout>
    </PageIntlProvider>
  );
}
