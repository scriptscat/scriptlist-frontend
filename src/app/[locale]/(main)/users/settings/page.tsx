import { Suspense } from 'react';
import SettingsClient from './components/SettingsClient';
import { userService } from '@/lib/api/services/user';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export default async function SettingsPage() {
  // 在服务端并行获取数据
  const [webhookData, notificationConfig, currentUser] = await Promise.all([
    userService.getWebhook(),
    userService.getUserConfig(),
    userService.getCurrentUser(),
  ]);

  return (
    <PageIntlProvider namespaces={['user']}>
      <Suspense fallback={<div>{'Loading...'}</div>}>
        <SettingsClient
          initialWebhookToken={webhookData.token}
          initialNotificationConfig={notificationConfig.notify}
          userStatus={currentUser?.status}
          deactivateAt={currentUser?.deactivate_at}
        />
      </Suspense>
    </PageIntlProvider>
  );
}
