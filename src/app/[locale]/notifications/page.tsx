import { Suspense } from 'react';
import NotificationsClient from './components/NotificationsClient';

// 获取通知服务
async function getNotificationService() {
  const { notificationService } = await import(
    '@/lib/api/services/notification'
  );
  return notificationService;
}

interface NotificationsPageProps {
  searchParams: Promise<{
    page?: string;
    read_status?: string;
    type?: string;
  }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const readStatus = resolvedSearchParams.read_status
    ? (parseInt(resolvedSearchParams.read_status) as 1 | 2)
    : undefined;
  const type = resolvedSearchParams.type
    ? parseInt(resolvedSearchParams.type)
    : undefined;

  // 获取通知服务实例
  const notificationService = await getNotificationService();

  // 在服务端获取通知列表和未读数
  const [notificationList, unreadCount] = await Promise.all([
    notificationService.getList({
      page,
      size: 20,
      read_status: readStatus,
      type,
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
        initialType={type}
        unreadCount={unreadCount}
      />
    </Suspense>
  );
}
