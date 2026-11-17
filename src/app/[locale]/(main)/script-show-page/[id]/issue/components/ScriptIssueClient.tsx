'use client';

import { Button, Input, Empty, Pagination, Card, theme, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { Issue } from '@/lib/api/services/scripts/issue';
import { useIssueList } from '@/lib/api/hooks/issue';
import { useResource } from '@/lib/api/hooks/useResource';
import { ISSUE_PAGE_SIZE, IssueRowsSkeleton } from './IssueRowSkeleton';
import IssueRow from './IssueRow';
import IssueStatusTabs from './IssueStatusTabs';

const PAGE_SIZE = ISSUE_PAGE_SIZE;

interface ScriptIssueClientProps {
  scriptId: number;
  initialPage: number;
  initialStatus: 'all' | 'pending' | 'resolved';
  initialKeyword: string;
  initialIssues: Issue[];
  initialTotal: number;
  initialOpenCount: number;
  initialClosedCount: number;
}

export default function ScriptIssueClient({
  scriptId,
  initialPage,
  initialStatus,
  initialKeyword,
  initialIssues,
  initialTotal,
  initialOpenCount,
  initialClosedCount,
}: ScriptIssueClientProps) {
  const { token } = theme.useToken();
  const t = useTranslations('script.issue');
  const tLoading = useTranslations('components.loading');

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentStatus, setCurrentStatus] = useState<
    'all' | 'pending' | 'resolved'
  >(initialStatus);
  const [currentKeyword, setCurrentKeyword] = useState(initialKeyword);
  const [searchValue, setSearchValue] = useState(initialKeyword);

  // 参数是否已偏离 SSR 初始值
  const paramsChanged =
    currentPage !== initialPage ||
    currentStatus !== initialStatus ||
    currentKeyword !== initialKeyword;

  // 仅在用户交互改变参数后才通过 SWR 获取，初始数据由 SSR props 提供（SEO）
  const swrParams = paramsChanged
    ? {
        page: currentPage,
        size: PAGE_SIZE,
        keyword: currentKeyword || undefined,
        sort: 'createtime' as const,
        ...(currentStatus === 'pending'
          ? { status: 1 as const }
          : currentStatus === 'resolved'
            ? { status: 3 as const }
            : {}),
      }
    : null;

  const swr = useIssueList(scriptId, swrParams);
  const { data, isInitialLoading, isRefreshing, error } = useResource(swr);

  const displayIssues = paramsChanged ? (data?.list ?? []) : initialIssues;
  // 加载中 / 失败时不要把 total 掉回 0，否则 Pagination 会整块卸载再挂回来。
  const totalCount = data?.total ?? initialTotal;
  // 表头的待解决 / 已解决数量只随关键字变化，与状态筛选无关；
  // 换筛选 / 翻页的请求在途时沿用上一次的数量，避免数字闪成 0。
  const latestCounts = !paramsChanged
    ? { open: initialOpenCount, closed: initialClosedCount }
    : data
      ? { open: data.open_count, closed: data.closed_count }
      : null;
  const [lastCounts, setLastCounts] = useState({
    open: initialOpenCount,
    closed: initialClosedCount,
  });
  if (
    latestCounts &&
    (latestCounts.open !== lastCounts.open ||
      latestCounts.closed !== lastCounts.closed)
  ) {
    setLastCounts(latestCounts);
  }
  const counts = latestCounts ?? lastCounts;
  // 搜索防抖窗口内输入框已经变了但请求还没发，这段时间也要给反馈。
  const searchPending = searchValue !== currentKeyword;

  // Sync URL without triggering navigation
  const syncURL = useCallback(
    (page: number, status: string, keyword: string) => {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (status !== 'all') params.set('status', status);
      if (page > 1) params.set('page', page.toString());
      const queryString = params.toString();
      const newURL = queryString ? `?${queryString}` : '';
      window.history.replaceState(
        null,
        '',
        `/script-show-page/${scriptId}/issue${newURL}`,
      );
    },
    [scriptId],
  );

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentKeyword) {
        setCurrentKeyword(searchValue);
        setCurrentPage(1);
        syncURL(1, currentStatus, searchValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, currentKeyword, currentStatus, syncURL]);

  // 处理筛选状态变化
  const handleStatusFilter = useCallback(
    (status: 'all' | 'pending' | 'resolved') => {
      setCurrentStatus(status);
      setCurrentPage(1);
      syncURL(1, status, currentKeyword);
    },
    [syncURL, currentKeyword],
  );

  // 处理搜索输入变化
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    },
    [],
  );

  // 处理搜索
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      setCurrentKeyword(value);
      setCurrentPage(1);
      syncURL(1, currentStatus, value);
    },
    [syncURL, currentStatus],
  );

  // 处理分页变化
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      syncURL(page, currentStatus, currentKeyword);
    },
    [syncURL, currentStatus, currentKeyword],
  );

  return (
    <Card className="shadow-sm">
      <div className="mx-auto">
        {/* 紧凑的页面头部 */}
        <div className="mb-4">
          {/* 紧凑的搜索筛选栏 */}
          <div className="flex gap-3">
            <Input.Search
              placeholder={t('search_placeholder')}
              value={searchValue}
              onChange={handleSearchInputChange}
              onSearch={handleSearch}
              allowClear
              loading={searchPending || (isRefreshing && !!currentKeyword)}
              className="flex-1 w-full"
            />
            <Link href={`/script-show-page/${scriptId}/issue/create`}>
              <Button type="primary" icon={<PlusOutlined />} size="middle">
                {t('create_issue')}
              </Button>
            </Link>
          </div>
        </div>

        {/* 问题列表：表头（状态切换 + 数量）始终在框内，下面是行 / 骨架 / 空 / 错误 */}
        <div
          className="overflow-hidden rounded-md border border-app-primary bg-app-elevated"
          aria-busy={isInitialLoading || isRefreshing}
        >
          <IssueStatusTabs
            status={currentStatus}
            openCount={counts.open}
            closedCount={counts.closed}
            onChange={handleStatusFilter}
          />
          {isInitialLoading ? (
            <IssueRowsSkeleton />
          ) : error && !data ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <span style={{ color: token.colorTextSecondary }}>
                {tLoading('failed')}
              </span>
              <Button onClick={() => swr.mutate()}>{tLoading('retry')}</Button>
            </div>
          ) : displayIssues.length === 0 ? (
            <div className="py-12 text-center">
              <Empty
                description={
                  <span style={{ color: token.colorTextSecondary }}>
                    {currentKeyword ? t('no_issues_found') : t('no_issues')}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <Spin spinning={isRefreshing}>
              {displayIssues.map((issue) => (
                <IssueRow key={issue.id} scriptId={scriptId} issue={issue} />
              ))}
            </Spin>
          )}
        </div>

        {/* 分页 */}
        {totalCount > PAGE_SIZE && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={PAGE_SIZE}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              size="small"
              showTotal={(total, range) => (
                <span
                  className="text-sm"
                  style={{ color: token.colorTextSecondary }}
                >
                  {t('pagination_total', {
                    start: range[0],
                    end: range[1],
                    total,
                  })}
                </span>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
