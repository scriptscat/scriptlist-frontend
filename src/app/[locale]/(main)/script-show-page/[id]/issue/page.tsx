import { scriptIssueService } from '@/lib/api/services/scripts/issue';
import type { IssueListParams } from '@/lib/api/services/scripts/issue';
import ScriptIssueClient from './components/ScriptIssueClient';
import { generateScriptMetadata } from '../metadata';
import type { ScriptDetailPageProps } from '../types';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'issue', locale);
}

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    status?: 'pending' | 'resolved';
    keyword?: string;
    sort?: string;
  }>;
}

export default async function ScriptIssuePage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const scriptId = parseInt(resolvedParams.id);

  // Build initial params for first page SSR fallback
  const initialPage = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page)
    : 1;
  const initialKeyword = resolvedSearchParams.keyword || '';
  const initialStatus: 'all' | 'pending' | 'resolved' =
    resolvedSearchParams.status === 'pending' ||
    resolvedSearchParams.status === 'resolved'
      ? resolvedSearchParams.status
      : 'all';

  const apiParams: IssueListParams = {
    page: initialPage,
    size: 15,
    keyword: initialKeyword || undefined,
    sort: resolvedSearchParams.sort || 'createtime',
  };

  if (initialStatus === 'pending') {
    apiParams.status = 1;
  } else if (initialStatus === 'resolved') {
    apiParams.status = 3;
  }

  let initialIssues: Awaited<
    ReturnType<typeof scriptIssueService.getIssueList>
  >['list'] = [];
  let initialTotal = 0;
  try {
    const data = await scriptIssueService.getIssueList(scriptId, apiParams);
    initialIssues = data.list;
    initialTotal = data.total;
  } catch (error) {
    console.error('Failed to fetch issues:', error);
  }

  return (
    <ScriptIssueClient
      scriptId={scriptId}
      initialPage={initialPage}
      initialStatus={initialStatus}
      initialKeyword={initialKeyword}
      initialIssues={initialIssues}
      initialTotal={initialTotal}
    />
  );
}
