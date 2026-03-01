'use client';

import {
  Button,
  Tag,
  Empty,
  Pagination,
  Card,
  Avatar,
  Space,
  theme,
  Skeleton,
} from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import React, { useState, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { Report } from '@/lib/api/services/scripts/report';
import { useSemDateTime } from '@/lib/utils/semdate';
import { useReportList } from '@/lib/api/hooks/report';

const PAGE_SIZE = 15;

const REASON_COLORS: Record<string, string> = {
  malware: 'red',
  privacy: 'orange',
  copyright: 'purple',
  spam: 'gold',
  other: 'default',
};

interface ScriptReportClientProps {
  scriptId: number;
  initialPage: number;
  initialStatus: 'all' | 'pending' | 'resolved';
  initialReports: Report[];
  initialTotal: number;
}

export default function ScriptReportClient({
  scriptId,
  initialPage,
  initialStatus,
  initialReports,
  initialTotal,
}: ScriptReportClientProps) {
  const { token } = theme.useToken();
  const semDateTime = useSemDateTime();
  const t = useTranslations('script.report');

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentStatus, setCurrentStatus] = useState<
    'all' | 'pending' | 'resolved'
  >(initialStatus);

  const paramsChanged =
    currentPage !== initialPage || currentStatus !== initialStatus;

  const swrParams = paramsChanged
    ? {
        page: currentPage,
        size: PAGE_SIZE,
        ...(currentStatus === 'pending'
          ? { status: 1 as const }
          : currentStatus === 'resolved'
            ? { status: 3 as const }
            : {}),
      }
    : null;

  const { data, isLoading } = useReportList(scriptId, swrParams);

  const displayReports = paramsChanged ? (data?.list ?? []) : initialReports;
  const totalCount = paramsChanged ? (data?.total ?? 0) : initialTotal;
  const loading = paramsChanged && isLoading;

  const syncURL = useCallback(
    (page: number, status: string) => {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (page > 1) params.set('page', page.toString());
      const queryString = params.toString();
      const newURL = queryString ? `?${queryString}` : '';
      window.history.replaceState(
        null,
        '',
        `/script-show-page/${scriptId}/report${newURL}`,
      );
    },
    [scriptId],
  );

  const handleStatusFilter = useCallback(
    (status: 'all' | 'pending' | 'resolved') => {
      setCurrentStatus(status);
      setCurrentPage(1);
      syncURL(1, status);
    },
    [syncURL],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      syncURL(page, currentStatus);
    },
    [syncURL, currentStatus],
  );

  return (
    <Card className="shadow-sm">
      <div className="mx-auto">
        <div className="mb-4">
          <div className="flex gap-3">
            <div className="flex-1" />
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
                {t('status_pending')}
              </Button>
              <Button
                type={currentStatus === 'resolved' ? 'primary' : 'default'}
                onClick={() => handleStatusFilter('resolved')}
                size="middle"
              >
                {t('status_resolved')}
              </Button>
            </Space.Compact>
          </div>
        </div>

        {loading ? (
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : displayReports.length === 0 ? (
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
                    {t('no_reports')}
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
            {displayReports.map((report, index) => (
              <div
                key={report.id}
                className="px-4 py-3 transition-colors duration-200 cursor-pointer"
                style={{
                  borderBottom:
                    index !== displayReports.length - 1
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
                  href={`/script-show-page/${scriptId}/report/${report.id}`}
                  target="_blank"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Tag
                                color={
                                  REASON_COLORS[report.reason] || 'default'
                                }
                              >
                                {t(`reasons.${report.reason}`)}
                              </Tag>
                              <Tag
                                color={
                                  report.status === 1 ? 'error' : 'success'
                                }
                                className="text-xs"
                              >
                                {report.status === 1
                                  ? t('status_pending')
                                  : t('status_resolved')}
                              </Tag>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-1 text-sm"
                            style={{ color: token.colorTextSecondary }}
                          >
                            <Link
                              href={'/users/' + report.user_id}
                              target="_blank"
                            >
                              <div className="flex items-center gap-1">
                                <Avatar size={20} src={report.avatar} />
                                <span>{report.username}</span>
                              </div>
                            </Link>
                            <span>{'#' + report.id}</span>
                            <span>{semDateTime(report.createtime)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div
                            className="flex items-center gap-1 text-base"
                            style={{ color: token.colorTextSecondary }}
                          >
                            <MessageOutlined style={{ fontSize: '16px' }} />
                            <span>{report.comment_count || 0}</span>
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
