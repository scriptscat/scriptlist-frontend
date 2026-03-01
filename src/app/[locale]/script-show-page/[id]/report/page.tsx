import { scriptReportService } from '@/lib/api/services/scripts/report';
import type { ReportListParams } from '@/lib/api/services/scripts/report';
import ScriptReportClient from './components/ScriptReportClient';
import { generateScriptMetadata } from '../metadata';
import type { ScriptDetailPageProps } from '../types';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'report', locale);
}

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    status?: 'pending' | 'resolved';
  }>;
}

export default async function ScriptReportPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const scriptId = parseInt(resolvedParams.id);

  const initialPage = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page)
    : 1;
  const initialStatus: 'all' | 'pending' | 'resolved' =
    resolvedSearchParams.status === 'pending' ||
    resolvedSearchParams.status === 'resolved'
      ? resolvedSearchParams.status
      : 'all';

  const apiParams: ReportListParams = {
    page: initialPage,
    size: 15,
  };

  if (initialStatus === 'pending') {
    apiParams.status = 1;
  } else if (initialStatus === 'resolved') {
    apiParams.status = 3;
  }

  let initialReports: Awaited<
    ReturnType<typeof scriptReportService.getReportList>
  >['list'] = [];
  let initialTotal = 0;
  try {
    const data = await scriptReportService.getReportList(scriptId, apiParams);
    initialReports = data.list;
    initialTotal = data.total;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
  }

  return (
    <ScriptReportClient
      scriptId={scriptId}
      initialPage={initialPage}
      initialStatus={initialStatus}
      initialReports={initialReports}
      initialTotal={initialTotal}
    />
  );
}
