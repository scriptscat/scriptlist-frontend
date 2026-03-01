import {
  auditLogService,
  type AuditLogListParams,
  type AuditLogItem,
} from '@/lib/api/services/auditLog';
import AuditLogList from './components/AuditLogList';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    action?: string;
  }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const initialPage = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page)
    : 1;
  const initialAction = resolvedSearchParams.action || '';

  const apiParams: AuditLogListParams = {
    page: initialPage,
    size: 20,
    action: initialAction || undefined,
  };

  let initialList: AuditLogItem[] = [];
  let initialTotal = 0;
  try {
    const data = await auditLogService.list(apiParams);
    initialList = data.list;
    initialTotal = data.total;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
  }

  return (
    <AuditLogList
      initialPage={initialPage}
      initialAction={initialAction}
      initialList={initialList}
      initialTotal={initialTotal}
    />
  );
}
