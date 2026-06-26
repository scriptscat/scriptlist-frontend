import AuthLayout from '@/components/layout/AuthLayout';
import { PageIntlProvider } from '@/components/PageIntlProvider';
export { noindexMetadata as metadata } from '@/lib/seo/robots';

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
