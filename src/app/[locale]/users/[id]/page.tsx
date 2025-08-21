import UserScriptList from '@/components/UserProfile/UserScriptList';
import scriptService from '@/lib/api/services/scripts';
import type { ScriptSearchRequest } from '../../script-show-page/[id]/types';
import { Suspense } from 'react';

interface UserPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<ScriptSearchRequest>;
}

export default async function UserPage({
  params,
  searchParams,
}: UserPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const userId = parseInt(id);

  // 转换URL参数到API请求参数
  const apiParams: ScriptSearchRequest = {
    page: resolvedSearchParams.page || 1,
    size: 20,
    keyword: resolvedSearchParams.keyword || undefined,
    sort: resolvedSearchParams.sort || 'today_download',
    domain: resolvedSearchParams.domain || undefined,
    category: resolvedSearchParams.category || undefined,
    script_type: resolvedSearchParams.script_type || undefined, // 默认搜索所有类型
    user_id: userId, // 指定用户ID
  };

  // 在服务端获取数据
  const scripts = await scriptService.search(apiParams);

  return (
    <Suspense fallback={<div>{'Loading script...'}</div>}>
      <UserScriptList
        userId={userId}
        scripts={scripts.list}
        totalCount={scripts.total}
        initialFilters={apiParams}
        initialPage={apiParams.page || 1}
      />
    </Suspense>
  );
}
