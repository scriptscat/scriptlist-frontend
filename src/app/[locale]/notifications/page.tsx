import { Suspense } from 'react';
import NotificationsClient from './components/NotificationsClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// 获取通知服务
async function getNotificationService() {
  const { notificationService } = await import(
    '@/lib/api/services/notification'
  );
  return notificationService;
}

export async function generateMetadata({
  searchParams,
}: NotificationsPageProps): Promise<Metadata> {
  const t = await getTranslations('notifications.metadata');

  return {
    title: t('title') + ' | ScriptCat',
    description: t('description'),
  };
}

interface NotificationsPageProps {
  searchParams: Promise<{
    page?: string;
    read_status?: string;
  }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const readStatus = resolvedSearchParams.read_status
    ? parseInt(resolvedSearchParams.read_status)
    : undefined;

  // 获取通知服务实例
  const notificationService = await getNotificationService();

  // 在服务端获取通知列表和未读数
  const [notificationList, unreadCount] = await Promise.all([
    notificationService.getList({
      page,
      size: 20,
      read_status: readStatus,
    }),
    notificationService.getUnreadCount(),
  ]);

  return (
    <Suspense fallback={<div>{'Loading...'}</div>}>
      <NotificationsClient
        initialNotifications={notificationList.list}
        totalCount={notificationList.total}
        initialPage={page}
        initialReadStatus={readStatus}
        unreadCount={unreadCount.total}
      />
    </Suspense>
  );
}
