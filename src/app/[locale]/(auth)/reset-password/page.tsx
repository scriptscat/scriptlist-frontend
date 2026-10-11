import { Suspense } from 'react';
// 深层导入：服务端组件若从 'antd' barrel 具名导入，整个 barrel 会变成客户端引用。
import Spin from 'antd/es/spin';
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
