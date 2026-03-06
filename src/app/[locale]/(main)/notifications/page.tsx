import NotificationsClient from './components/NotificationsClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';

export async function generateMetadata(): Promise<Metadata> {
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

  return (
    <PageIntlProvider namespaces={['notifications']}>
      <NotificationsClient initialPage={page} initialReadStatus={readStatus} />
    </PageIntlProvider>
  );
}
