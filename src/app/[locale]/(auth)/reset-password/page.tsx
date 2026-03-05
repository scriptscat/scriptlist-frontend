import { Suspense } from 'react';
import { Spin } from 'antd';
import ResetPasswordClient from './components/ResetPasswordClient';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Spin size="large" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
