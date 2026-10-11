import UserScriptList from '@/components/UserProfile/UserScriptList';
import scriptService from '@/lib/api/services/scripts';
import { slimScriptList } from '@/lib/utils/script-slim';
import type { ScriptSearchRequest } from '../../script-show-page/[id]/types';

interface UserPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<ScriptSearchRequest>;
}

function toNumber<T extends number>(value: unknown, allowed: readonly T[]) {
  const numericValue = Number(value);
  return allowed.includes(numericValue as T) ? (numericValue as T) : undefined;
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
    script_type: toNumber(resolvedSearchParams.script_type, [0, 1, 2, 3, 4]), // 默认搜索所有类型
    status: toNumber(resolvedSearchParams.status, [0, 1, 2, 3]),
    user_id: userId, // 指定用户ID
  };

  // 在服务端获取数据
  const scripts = await scriptService.search(apiParams);

  // 这里不放 <Suspense>：`scripts` 已经在上面 await 完，
  // UserScriptList 是不会挂起的客户端组件，边界永远不会命中 fallback。
  // 而且本页的翻页 / 筛选都只改 searchParams，插一个边界反而会把
  // UserScriptList 自己的 useTransition 变暗效果换成整块 fallback。
  return (
    <UserScriptList
      userId={userId}
      scripts={slimScriptList(scripts.list)}
      totalCount={scripts.total}
      initialFilters={apiParams}
      initialPage={apiParams.page || 1}
    />
  );
}
