import { Suspense } from 'react';
import { Spin } from 'antd';
import AuthorizeClient from './components/AuthorizeClient';

export default function OAuthAuthorizePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Spin size="large" />
        </div>
      }
    >
      <AuthorizeClient />
    </Suspense>
  );
}
