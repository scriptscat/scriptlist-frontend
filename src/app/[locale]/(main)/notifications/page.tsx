import NotificationsClient from './components/NotificationsClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import { noindexRobots } from '@/lib/seo/robots';
import { notificationService } from '@/lib/api/services/notification';
import type { Notification } from '@/lib/api/services/notification';

/** 与 NotificationsClient 的 PAGE_SIZE 保持一致，SSR 预取的必须正好是首屏那一页。 */
const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notifications.metadata');

  return {
    title: t('title') + ' | ScriptCat',
    description: t('description'),
    robots: noindexRobots,
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

  // 服务端预取首屏那一页。不预取的话整页是客户端冷启动，
  // 首屏必然先画一块骨架，等 SWR 取完才有内容。
  // 取数失败不阻断渲染：客户端会自己再取一次，期间画骨架。
  let initialList: Notification[] | undefined;
  let initialTotal = 0;
  try {
    const data = await notificationService.getList({
      page,
      size: PAGE_SIZE,
      read_status: readStatus,
    });
    initialList = data.list;
    initialTotal = data.total;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }

  return (
    <PageIntlProvider namespaces={['notifications']}>
      <NotificationsClient
        initialPage={page}
        initialReadStatus={readStatus}
        initialList={initialList}
        initialTotal={initialTotal}
      />
    </PageIntlProvider>
  );
}
