import { Row, Col } from 'antd';
import Sidebar from '@/components/Sidebar';
import ScriptList from '@/components/Scriptlist';
import { scriptService } from '@/lib/api/services/scripts';
import type { ScriptSearchRequest } from '../script-show-page/[id]/types';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: Promise<ScriptSearchRequest>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;

  let title = '脚本搜索';

  // 如果有搜索关键词，使用关键词作为标题
  if (resolvedSearchParams.keyword) {
    title = `${resolvedSearchParams.keyword} - 脚本搜索`;
  }

  // 如果是第2页及以后，添加页码信息
  if (resolvedSearchParams.page && resolvedSearchParams.page > 1) {
    title = `${title} - 第${resolvedSearchParams.page}页`;
  }

  // 添加站点后缀
  title += ' | 脚本猫';

  return {
    title,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  // 转换URL参数到API请求参数
  const apiParams: ScriptSearchRequest = {
    page: resolvedSearchParams.page ? resolvedSearchParams.page : 1,
    size: 20,
    keyword: resolvedSearchParams.keyword || undefined,
    sort: resolvedSearchParams.sort || 'today_download',
    domain: resolvedSearchParams.domain || undefined,
    category: resolvedSearchParams.category || undefined,
    script_type: resolvedSearchParams.script_type || 0, // 默认搜索所有类型
  };

  // 在服务端获取数据
  const [scripts, recentScripts, ratingScripts] = await Promise.all([
    scriptService.search(apiParams),
    scriptService.search({
      size: 10,
      page: 1,
      sort: 'createtime',
    }),
    scriptService.lastScoreScript(),
  ]);

  return (
    <Row gutter={[24, 24]}>
      {/* 主要内容区域 */}
      <Col xs={24} lg={18}>
        {/* 搜索区域 */}
        <ScriptList
          scripts={scripts.list}
          totalCount={scripts.total}
          initialFilters={apiParams}
          initialPage={apiParams.page || 1}
        />
      </Col>

      {/* 侧边栏 */}
      <Col xs={24} lg={6}>
        <Sidebar
          recentScripts={recentScripts.list}
          ratingScripts={ratingScripts.list}
        />
      </Col>
    </Row>
  );
}
