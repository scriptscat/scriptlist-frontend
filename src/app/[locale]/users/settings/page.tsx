import { Suspense } from 'react';
import SettingsClient from './components/SettingsClient';
import { userService } from '@/lib/api/services/user';

export default async function SettingsPage() {
  // 在服务端并行获取数据
  const [webhookData, notificationConfig] = await Promise.all([
    userService.getWebhook(),
    userService.getUserConfig(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsClient
        initialWebhookToken={webhookData.token}
        initialNotificationConfig={notificationConfig.notify}
      />
    </Suspense>
  );
}
