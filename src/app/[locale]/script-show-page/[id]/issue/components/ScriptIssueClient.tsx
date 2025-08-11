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
} from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import type { Issue } from '@/lib/api/services/scripts/issue';
import { useSemDateTime } from '@/lib/utils/semdate';
import IssueLabel from './IssueLabel';

interface ScriptIssueClientProps {
  issues: Issue[];
  totalCount: number;
  scriptId: number;
  initialPage: number;
  initialStatus: 'all' | 'pending' | 'resolved';
}

export default function ScriptIssueClient({
  issues,
  totalCount,
  scriptId,
}: ScriptIssueClientProps) {
  const { token } = theme.useToken();
  const router = useRouter();
  const searchParams = useSearchParams();
  const semDateTime = useSemDateTime();

  // 从 URL 参数获取当前状态
  const currentKeyword = searchParams.get('keyword') || '';
  const urlStatus = searchParams.get('status');
  const currentStatus: 'all' | 'pending' | 'resolved' =
    urlStatus === 'pending' || urlStatus === 'resolved' ? urlStatus : 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [searchValue, setSearchValue] = useState(currentKeyword); // 输入框的值

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentKeyword) {
        updateURL({ keyword: searchValue, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, currentKeyword]);

  // 更新 URL 参数
  const updateURL = (params: {
    keyword?: string;
    status?: 'all' | 'pending' | 'resolved';
    page?: number;
  }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (params.keyword !== undefined) {
      if (params.keyword) {
        newSearchParams.set('keyword', params.keyword);
      } else {
        newSearchParams.delete('keyword');
      }
    }

    if (params.status !== undefined) {
      if (params.status && params.status !== 'all') {
        newSearchParams.set('status', params.status);
      } else {
        newSearchParams.delete('status');
      }
    }

    if (params.page !== undefined) {
      if (params.page > 1) {
        newSearchParams.set('page', params.page.toString());
      } else {
        newSearchParams.delete('page');
      }
    }

    const queryString = newSearchParams.toString();
    const newURL = queryString ? `?${queryString}` : '';

    router.push(`/script-show-page/${scriptId}/issue${newURL}`);
  };

  // 过滤和搜索逻辑现在由服务端处理，这里直接显示数据
  const displayIssues = issues;

  // 处理筛选状态变化
  const handleStatusFilter = (status: 'all' | 'pending' | 'resolved') => {
    updateURL({ status, page: 1 });
  };

  // 处理搜索输入变化
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateURL({ keyword: value, page: 1 });
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const pageSize = 15;

  return (
    <Card className="shadow-sm">
      <div className="mx-auto">
        {/* 紧凑的页面头部 */}
        <div className="mb-4">
          {/* 紧凑的搜索筛选栏 */}
          <div className="flex gap-3">
            <Input.Search
              placeholder="搜索问题..."
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
                全部
              </Button>
              <Button
                type={currentStatus === 'pending' ? 'primary' : 'default'}
                onClick={() => handleStatusFilter('pending')}
                size="middle"
              >
                待解决
              </Button>
              <Button
                type={currentStatus === 'resolved' ? 'primary' : 'default'}
                onClick={() => handleStatusFilter('resolved')}
                size="middle"
              >
                已解决
              </Button>
            </Space.Compact>
            <Link href={`/script-show-page/${scriptId}/issue/create`}>
              <Button type="primary" icon={<PlusOutlined />} size="middle">
                新建问题
              </Button>
            </Link>
          </div>
        </div>

        {/* 问题列表 */}
        {displayIssues.length === 0 ? (
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
                    {currentKeyword ? '没有找到匹配的问题' : '还没有问题'}
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
                <div className="flex items-start gap-3">
                  {/* 主要内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* 标题和标签 */}
                        <div className="mb-2">
                          <Link
                            href={`/script-show-page/${scriptId}/issue/${issue.id}`}
                            onMouseEnter={(e) => {
                              const textElement =
                                e.currentTarget.querySelector('h5');
                              if (textElement) {
                                textElement.style.color = token.colorPrimary;
                              }
                            }}
                            onMouseLeave={(e) => {
                              const textElement =
                                e.currentTarget.querySelector('h5');
                              if (textElement) {
                                textElement.style.color = token.colorText;
                              }
                            }}
                          >
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
                                {issue.status === 1 ? '待解决' : '已解决'}
                              </Tag>
                            </div>
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {issue.labels.slice(0, 4).map((label) => (
                              <IssueLabel key={label} label={label} />
                            ))}
                            {issue.labels.length > 4 && (
                              <Tag color="default" className="text-xs">
                                +{issue.labels.length - 4}
                              </Tag>
                            )}
                          </div>
                        </div>

                        {/* 用户和时间信息 */}
                        <div
                          className="flex items-center gap-1 text-sm"
                          style={{ color: token.colorTextSecondary }}
                        >
                          <div className="flex items-center gap-1">
                            <Avatar size={20} src={issue.avatar} />
                            <span>{issue.username}</span>
                          </div>
                          <span>#{issue.id}</span>
                          <span>{semDateTime(issue.createtime)}</span>
                          {issue.updatetime > 0 &&
                            issue.updatetime !== issue.createtime && (
                              <span>
                                • 更新于 {semDateTime(issue.updatetime)}
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
                          <span>{issue.replies_count || 0}</span>
                        </div>
                        {/* <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          style={{
                            color: token.colorTextTertiary,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = token.colorPrimary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color =
                              token.colorTextTertiary;
                          }}
                        /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalCount > pageSize && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              size="small"
              showTotal={(total, range) => (
                <span
                  className="text-sm"
                  style={{ color: token.colorTextSecondary }}
                >
                  {range[0]}-{range[1]} / {total}
                </span>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
