'use client';

import { useState, useTransition } from 'react';
import { Input, Select, Button, Pagination, Space, Card, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import ScriptCard from '../Scriptlist/ScriptCard';
import type {
  ScriptListItem,
  ScriptSearchRequest,
} from '@/app/[locale]/script-show-page/[id]/types';

const { Option } = Select;

interface UserScriptListProps {
  userId: number;
  scripts: ScriptListItem[];
  totalCount: number;
  initialFilters?: ScriptSearchRequest;
  initialPage?: number;
}

export default function UserScriptList({
  userId,
  scripts,
  totalCount,
  initialFilters,
  initialPage = 1,
}: UserScriptListProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const userT = useTranslations('user.script_list');
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<ScriptSearchRequest>(
    initialFilters || {
      keyword: '',
      sort: undefined,
      user_id: userId,
    },
  );

  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 20;

  // 更新URL参数 - 修改为用户页面的路径
  const updateURL = (newFilters: ScriptSearchRequest, page: number) => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (newFilters.keyword) params.set('keyword', newFilters.keyword);
      if (newFilters.domain) params.set('domain', newFilters.domain);
      if (newFilters.script_type) {
        params.set('script_type', newFilters.script_type.toString());
      }
      if (newFilters.sort) params.set('sort', newFilters.sort);
      if (newFilters.category) params.set('category', newFilters.category);
      if (page > 1) params.set('page', page.toString());

      const paramString = params.toString();
      const newURL = `/${locale}/users/${userId}${paramString ? `?${paramString}` : ''}`;
      router.push(newURL);
    });
  };

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, keyword: value };
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

  const handleScriptTypeChange = (
    value: ScriptSearchRequest['script_type'],
  ) => {
    const newFilters = { ...filters, script_type: value };
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
            placeholder={userT('search_placeholder')}
            enterButton={
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={isPending}
              >
                {userT('search_button')}
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            defaultValue={filters.keyword}
            disabled={isPending}
          />

          <Space wrap>
            <Select
              placeholder={userT('all_types_placeholder')}
              style={{ width: 150 }}
              value={filters.script_type || undefined}
              onChange={handleScriptTypeChange}
              allowClear
              disabled={isPending}
            >
              <Option value={0}>{userT('type_all')}</Option>
              <Option value={1}>{userT('type_script')}</Option>
              <Option value={2}>{t('library')}</Option>
              <Option value={3}>{t('background_script')}</Option>
              <Option value={4}>{t('scheduled_script')}</Option>
            </Select>

            <Select
              value={filters.sort}
              style={{ width: 150 }}
              onChange={handleSortChange}
              disabled={isPending}
            >
              <Option value="today_download">{userT('sort_by_hot')}</Option>
              <Option value="createtime">{userT('sort_by_latest')}</Option>
              <Option value="updatetime">{userT('sort_by_updated')}</Option>
              <Option value="score">{userT('sort_by_score')}</Option>
              <Option value="total_download">
                {userT('sort_by_downloads')}
              </Option>
            </Select>
          </Space>
        </Space>
      </Card>

      {/* 脚本列表 */}
      <Spin spinning={isPending} tip={userT('loading')}>
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
            userT('pagination_total', {
              start: range[0],
              end: range[1],
              total: total,
            })
          }
          disabled={isPending}
        />
      </div>
    </>
  );
}
