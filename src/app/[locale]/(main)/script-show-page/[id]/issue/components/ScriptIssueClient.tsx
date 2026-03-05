'use client';

import {
  Button,
  Tag,
  Typography,
  Input,
  Empty,
  Pagination,
  Card,
  Avatar,
  Space,
  theme,
  Skeleton,
} from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { Issue } from '@/lib/api/services/scripts/issue';
import { useSemDateTime } from '@/lib/utils/semdate';
import { useIssueList } from '@/lib/api/hooks/issue';
import IssueLabel from './IssueLabel';

const PAGE_SIZE = 15;

interface ScriptIssueClientProps {
  scriptId: number;
  initialPage: number;
  initialStatus: 'all' | 'pending' | 'resolved';
  initialKeyword: string;
  initialIssues: Issue[];
  initialTotal: number;
}

export default function ScriptIssueClient({
  scriptId,
  initialPage,
  initialStatus,
  initialKeyword,
  initialIssues,
  initialTotal,
}: ScriptIssueClientProps) {
  const { token } = theme.useToken();
  const semDateTime = useSemDateTime();
  const t = useTranslations('script.issue');

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

  const { data, isLoading } = useIssueList(scriptId, swrParams);

  const displayIssues = paramsChanged ? (data?.list ?? []) : initialIssues;
  const totalCount = paramsChanged ? (data?.total ?? 0) : initialTotal;
  const loading = paramsChanged && isLoading;

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
              className="flex-1 w-full"
            />
            <Space.Compact>
              <Button
                type={currentStatus === 'all' ? 'primary' : 'default'}
                onClick={() => handleStatusFilter('all')}
                size="middle"
              >
                {t('filter_all')}
              </Button>
              <Button
                type={currentStatus === 'pending' ? 'primary' : 'default'}
                onClick={() => handleStatusFilter('pending')}
                size="middle"
              >
                {t('filter_pending')}
              </Button>
              <Button
                type={currentStatus === 'resolved' ? 'primary' : 'default'}
                onClick={() => handleStatusFilter('resolved')}
                size="middle"
              >
                {t('filter_resolved')}
              </Button>
            </Space.Compact>
            <Link href={`/script-show-page/${scriptId}/issue/create`}>
              <Button type="primary" icon={<PlusOutlined />} size="middle">
                {t('create_issue')}
              </Button>
            </Link>
          </div>
        </div>

        {/* 问题列表 */}
        {loading ? (
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : displayIssues.length === 0 ? (
          <div
            style={{
              border: `1px solid ${token.colorBorder}`,
              backgroundColor: token.colorBgContainer,
              borderRadius: token.borderRadius,
            }}
          >
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
          </div>
        ) : (
          <div
            style={{
              border: `1px solid ${token.colorBorder}`,
              backgroundColor: token.colorBgContainer,
              borderRadius: token.borderRadius,
            }}
          >
            {displayIssues.map((issue, index) => (
              <div
                key={issue.id}
                className="px-4 py-3 transition-colors duration-200 cursor-pointer"
                style={{
                  borderBottom:
                    index !== displayIssues.length - 1
                      ? `1px solid ${token.colorBorder}`
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    token.colorBgTextHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Link
                  href={`/script-show-page/${scriptId}/issue/${issue.id}`}
                  target="_blank"
                >
                  <div className="flex items-start gap-3">
                    {/* 主要内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* 标题和标签 */}
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Typography.Title level={5}>
                                {issue.title}
                              </Typography.Title>

                              <Tag
                                color={
                                  issue.status === 1 ? 'warning' : 'success'
                                }
                                className="text-xs"
                              >
                                {issue.status === 1
                                  ? t('status_pending')
                                  : t('status_resolved')}
                              </Tag>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {issue.labels.slice(0, 4).map((label) => (
                                <IssueLabel key={label} label={label} />
                              ))}
                              {issue.labels.length > 4 && (
                                <Tag color="default" className="text-xs">
                                  {'+' + (issue.labels.length - 4)}
                                </Tag>
                              )}
                            </div>
                          </div>

                          {/* 用户和时间信息 */}
                          <div
                            className="flex items-center gap-1 text-sm"
                            style={{ color: token.colorTextSecondary }}
                          >
                            <Link
                              href={'/users/' + issue.user_id}
                              target="_blank"
                            >
                              <div className="flex items-center gap-1">
                                <Avatar size={20} src={issue.avatar} />
                                <span>{issue.username}</span>
                              </div>
                            </Link>
                            <span>{'#' + issue.id}</span>
                            <span>{semDateTime(issue.createtime)}</span>
                            {issue.updatetime > 0 &&
                              issue.updatetime !== issue.createtime && (
                                <span>
                                  {'• ' +
                                    t('updated_at', {
                                      time: semDateTime(issue.updatetime),
                                    })}
                                </span>
                              )}
                          </div>
                        </div>

                        {/* 右侧信息 */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div
                            className="flex items-center gap-1 text-base"
                            style={{ color: token.colorTextSecondary }}
                          >
                            <MessageOutlined style={{ fontSize: '16px' }} />
                            <span>{issue.comment_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

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
