import { Suspense } from 'react';
import { Spin } from 'antd';
import AuthorizeClient from './components/AuthorizeClient';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export default function OAuthAuthorizePage() {
  return (
    <PageIntlProvider namespaces={['oauth']}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Spin size="large" />
          </div>
        }
      >
        <AuthorizeClient />
      </Suspense>
    </PageIntlProvider>
  );
}
