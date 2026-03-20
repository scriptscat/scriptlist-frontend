'use client';

import { useCallback, useEffect, useState } from 'react';
import { message, Select, Table, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type { AdminReportItem } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';
import { Link } from '@/i18n/routing';

const REASON_COLORS: Record<string, string> = {
  malware: 'red',
  privacy: 'orange',
  copyright: 'purple',
  spam: 'gold',
  other: 'default',
};

export default function ReportsClient() {
  const t = useTranslations('admin.reports');
  const tReport = useTranslations('script.report');
  const [data, setData] = useState<AdminReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (p: number = page, s: number | undefined = status) => {
      setLoading(true);
      try {
        const resp = await adminService.listReports(p, 20, s);
        setData(resp.list || []);
        setTotal(resp.total);
      } catch (err) {
        if (err instanceof APIError) {
          message.error(err.msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, status],
  );

  useEffect(() => {
    fetchData(page, status);
  }, [page, status]);

  const handleStatusChange = (value: number | undefined) => {
    setStatus(value);
    setPage(1);
  };

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
      render: (reason: string) => (
        <Tag color={REASON_COLORS[reason] || 'default'}>
          {tReport(`reasons.${reason}`)}
        </Tag>
      ),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (val: number) => (
        <Tag color={val === 1 ? 'error' : 'success'}>
          {val === 1 ? tReport('status_pending') : tReport('status_resolved')}
        </Tag>
      ),
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Select
          allowClear
          placeholder={t('filter_status')}
          value={status}
          onChange={handleStatusChange}
          style={{ width: 160 }}
          options={[
            { value: 1, label: tReport('status_pending') },
            { value: 3, label: tReport('status_resolved') },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
        }}
      />
    </div>
  );
}
