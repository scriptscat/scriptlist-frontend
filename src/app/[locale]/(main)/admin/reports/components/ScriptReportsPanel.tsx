'use client';

import { useState } from 'react';
import { Select, Table, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import type { AdminReportItem } from '@/lib/api/services/admin';
import { useAdminReports } from '@/lib/api/hooks/admin';
import type { ColumnsType } from 'antd/es/table';
import { Link } from '@/i18n/routing';
import { useTableStateLocale } from '../../components/tableState';
import { AdminResponsiveList } from '../../components/AdminResponsiveList';
import type { AdminCardSpec } from '../../components/AdminResponsiveList';

const REASON_COLORS: Record<string, string> = {
  malware: 'red',
  privacy: 'orange',
  copyright: 'purple',
  spam: 'gold',
  other: 'default',
};

export default function ScriptReportsPanel() {
  const t = useTranslations('admin.reports');
  const tReport = useTranslations('script.report');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<number | undefined>(undefined);

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useAdminReports({ page, status });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  const handleStatusChange = (value: number | undefined) => {
    setStatus(value);
    setPage(1);
  };

  const reasonTag = (reason: string) => (
    <Tag color={REASON_COLORS[reason] || 'default'}>
      {tReport(`reasons.${reason}`)}
    </Tag>
  );

  const statusTag = (val: number) => (
    <Tag color={val === 1 ? 'error' : 'success'}>
      {val === 1 ? tReport('status_pending') : tReport('status_resolved')}
    </Tag>
  );

  const toCard = (record: AdminReportItem): AdminCardSpec => ({
    title: (
      <Link href={`/script-show-page/${record.script_id}`} target="_blank">
        {record.script_name || `#${record.script_id}`}
      </Link>
    ),
    subtitle: [
      `#${record.id}`,
      <Link key="reporter" href={`/users/${record.user_id}`} target="_blank">
        {record.username}
      </Link>,
    ],
    badges: (
      <>
        {statusTag(record.status)}
        {reasonTag(record.reason)}
      </>
    ),
    fields: [{ label: t('col_comments'), value: record.comment_count }],
    time: record.createtime,
    actions: [
      {
        key: 'view',
        label: t('action_view'),
        href: `/script-show-page/${record.script_id}/report/${record.id}`,
        target: '_blank',
      },
    ],
  });

  const columns: ColumnsType<AdminReportItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('col_script'),
      key: 'script',
      render: (_: unknown, record: AdminReportItem) => (
        <Link href={`/script-show-page/${record.script_id}`} target="_blank">
          {record.script_name || `#${record.script_id}`}
        </Link>
      ),
    },
    {
      title: t('col_reporter'),
      key: 'reporter',
      render: (_: unknown, record: AdminReportItem) => (
        <Link href={`/users/${record.user_id}`} target="_blank">
          {record.username}
        </Link>
      ),
    },
    {
      title: t('col_reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => reasonTag(reason),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (val: number) => statusTag(val),
    },
    {
      title: t('col_comments'),
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 80,
    },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      key: 'createtime',
      render: (val: number) => new Date(val * 1000).toLocaleString(),
    },
    {
      title: t('col_actions'),
      key: 'actions',
      render: (_: unknown, record: AdminReportItem) => (
        <Link
          href={`/script-show-page/${record.script_id}/report/${record.id}`}
          target="_blank"
        >
          {t('action_view')}
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Select
          allowClear
          placeholder={t('filter_status')}
          value={status}
          onChange={handleStatusChange}
          className="!w-full md:!w-[160px]"
          options={[
            { value: 1, label: tReport('status_pending') },
            { value: 3, label: tReport('status_resolved') },
          ]}
        />
      </div>

      <AdminResponsiveList<AdminReportItem>
        table={
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={isLoading || isRefreshing}
            locale={tableLocale}
            pagination={{
              current: page,
              total,
              pageSize: 20,
              onChange: setPage,
            }}
          />
        }
        rows={data}
        rowKey="id"
        card={toCard}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={refresh}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
      />
    </div>
  );
}
