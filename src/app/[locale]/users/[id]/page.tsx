import { Row, Col } from 'antd';
import Sidebar from '@/components/Sidebar';
import UserScriptList from '@/components/UserProfile/UserScriptList';
import scriptService from '@/lib/api/services/scripts';
import { ScriptSearchRequest } from '../../script-show-page/[id]/types';
import { Suspense } from 'react';

interface UserPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: ScriptSearchRequest;
}

export default async function UserPage({
  params,
  searchParams,
}: UserPageProps) {
  const { id } = await params;
  const userId = parseInt(id);

  // 转换URL参数到API请求参数
  const apiParams: ScriptSearchRequest = {
    page: searchParams.page || 1,
    size: 20,
    keyword: searchParams.keyword || undefined,
    sort: searchParams.sort || 'today_download',
    domain: searchParams.domain || undefined,
    script_type: 0, // 默认搜索所有类型
    user_id: userId, // 指定用户ID
  };

  // 在服务端获取数据
  const scripts = await scriptService.search(apiParams);

  return (
    <Suspense fallback={<div>Loading script...</div>}>
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
