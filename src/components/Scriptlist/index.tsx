'use client';

import { useState, useTransition } from 'react';
import { Input, Select, Button, Pagination, Space, Card, Spin } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCategoryList } from '@/lib/api/hooks';
import ScriptCard from './ScriptCard';
import type {
  ScriptListItem,
  ScriptSearchRequest,
} from '@/app/[locale]/script-show-page/[id]/types';

const { Option } = Select;

interface ScriptListProps {
  scripts: ScriptListItem[];
  totalCount: number;
  initialFilters?: ScriptSearchRequest;
  initialPage?: number;
}

export default function ScriptList({
  scripts,
  totalCount,
  initialFilters,
  initialPage = 1,
}: ScriptListProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: categoryData, isLoading: isCategoryLoading } =
    useCategoryList();

  const [filters, setFilters] = useState<ScriptSearchRequest>(
    initialFilters || {
      keyword: '',
      sort: undefined,
    },
  );

  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 20;

  // 更新URL参数
  const updateURL = (newFilters: ScriptSearchRequest, page: number) => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (newFilters.keyword) params.set('keyword', newFilters.keyword);
      if (newFilters.domain) params.set('domain', newFilters.domain);
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.sort) params.set('sort', newFilters.sort);
      if (page > 1) params.set('page', page.toString());

      const paramString = params.toString();
      const newURL = `/${locale}/search${paramString ? `?${paramString}` : ''}`;
      router.push(newURL);
    });
  };

  const handleSearch = (value: string) => {
    // 允许空搜索，这样用户可以浏览所有脚本
    const newFilters = { ...filters, keyword: value.trim() || '' };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...filters, category: value || '' };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  const handleSortChange = (value: ScriptSearchRequest['sort']) => {
    const newFilters = { ...filters, sort: value };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(filters, page);
  };

  return (
    <>
      {/* 搜索区域 */}
      <Card className="!mb-6" style={{ borderRadius: '16px' }}>
        <Space direction="vertical" size="large" className="w-full mb-6">
          <Input.Search
            placeholder="搜索脚本，开启新世界"
            enterButton={
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={isPending}
              >
                搜索
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            disabled={isPending}
          />

          <Space wrap>
            <Select
              placeholder="所有分类"
              style={{ width: 150 }}
              value={filters.category || undefined}
              onChange={handleCategoryChange}
              allowClear
              disabled={isPending}
              loading={isCategoryLoading}
            >
              {categoryData?.categories?.map((category) => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>

            <Select
              value={filters.sort}
              style={{ width: 150 }}
              onChange={handleSortChange}
              disabled={isPending}
            >
              <Option value="today_download">热度排序</Option>
              <Option value="createtime">最新发布</Option>
              <Option value="updatetime">最近更新</Option>
              <Option value="score">评分最高</Option>
              <Option value="total_download">下载最多</Option>
            </Select>

            <Button icon={<FilterOutlined />} disabled={isPending}>
              高级筛选
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 脚本列表 */}
      <Spin spinning={isPending} tip="加载中...">
        <Space direction="vertical" size="large" className="w-full">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </Space>
      </Spin>

      {/* 分页 */}
      <div className="flex justify-center mt-8">
        <Pagination
          current={currentPage}
          total={totalCount}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} / 共 ${total} 个脚本`
          }
          disabled={isPending}
        />
      </div>
    </>
  );
}
