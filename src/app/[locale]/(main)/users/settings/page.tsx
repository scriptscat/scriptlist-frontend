import { Suspense } from 'react';
import SettingsClient from './components/SettingsClient';
import { userService } from '@/lib/api/services/user';
import { PageIntlProvider } from '@/components/PageIntlProvider';
export { noindexMetadata as metadata } from '@/lib/seo/robots';

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { tab } = await searchParams;

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
          initialTab={tab}
          initialWebhookToken={webhookData.token}
          initialNotificationConfig={notificationConfig.notify}
          userStatus={currentUser?.status}
          deactivateAt={currentUser?.deactivate_at}
        />
      </Suspense>
    </PageIntlProvider>
  );
}
