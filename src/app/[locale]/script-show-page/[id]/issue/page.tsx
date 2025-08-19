import { scriptIssueService } from '@/lib/api/services/scripts/issue';
import type { IssueListParams } from '@/lib/api/services/scripts/issue';
import ScriptIssueClient from './components/ScriptIssueClient';
import { generateScriptMetadata } from '../metadata';
import type { ScriptDetailPageProps } from '../types';
import type { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
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

  // 构建API请求参数
  const apiParams: IssueListParams = {
    page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1,
    size: 15,
    keyword: resolvedSearchParams.keyword || undefined,
    sort: resolvedSearchParams.sort || 'createtime',
  };

  // 根据状态筛选
  if (resolvedSearchParams.status === 'pending') {
    apiParams.status = 1;
  } else if (resolvedSearchParams.status === 'resolved') {
    apiParams.status = 3;
  }

  try {
    // 在服务端获取数据
    const issuesData = await scriptIssueService.getIssueList(
      scriptId,
      apiParams,
    );

    // 确定当前状态筛选
    const currentStatus = resolvedSearchParams.status
      ? resolvedSearchParams.status === 'pending'
        ? 'pending'
        : 'resolved'
      : 'all';

    return (
      <ScriptIssueClient
        issues={issuesData.list}
        totalCount={issuesData.total}
        scriptId={scriptId}
        initialPage={apiParams.page || 1}
        initialStatus={currentStatus}
      />
    );
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    // 如果获取失败，返回空数据
    return (
      <ScriptIssueClient
        issues={[]}
        totalCount={0}
        scriptId={scriptId}
        initialPage={1}
        initialStatus="all"
      />
    );
  }
}
