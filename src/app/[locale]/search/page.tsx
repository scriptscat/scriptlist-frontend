import { Row, Col } from 'antd';
import Sidebar from '@/components/Sidebar';
import ScriptList from '@/components/Scriptlist';
import scriptService from '@/lib/api/services/scripts';
import { ScriptSearchRequest } from '../script-show-page/[id]/types';

interface SearchPageProps {
  searchParams: ScriptSearchRequest;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // 转换URL参数到API请求参数
  const apiParams: ScriptSearchRequest = {
    page: searchParams.page ? searchParams.page : 1,
    size: 20,
    keyword: searchParams.keyword || undefined,
    sort: searchParams.sort || 'today_download',
    domain: searchParams.domain || undefined,
    script_type: 0, // 默认搜索所有类型
  };

  // 在服务端获取数据
  const scripts = await scriptService.search(apiParams);

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
        <Sidebar />
      </Col>
    </Row>
  );
}
