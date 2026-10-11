import { Suspense } from 'react';
// 深层导入：服务端组件若从 'antd' barrel 具名导入，整个 barrel 会变成客户端引用。
import Spin from 'antd/es/spin';
import AuthorizeClient from './components/AuthorizeClient';
import { PageIntlProvider } from '@/components/PageIntlProvider';
export { noindexMetadata as metadata } from '@/lib/seo/robots';

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
