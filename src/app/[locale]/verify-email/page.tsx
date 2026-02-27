import { Suspense } from 'react';
import { Spin } from 'antd';
import VerifyEmailClient from './components/VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Spin size="large" />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
