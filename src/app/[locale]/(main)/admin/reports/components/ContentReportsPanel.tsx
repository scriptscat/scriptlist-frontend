'use client';

import { useState } from 'react';
import { Button, Select, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ADMIN_PAGE_SIZE, useAdminContentReports } from '@/lib/api/hooks/admin';
import type {
  AdminContentReportItem,
  ContentReportTargetType,
} from '@/types/api';
import { useTableStateLocale } from '../../components/tableState';
import ContentReportActions from './ContentReportActions';
import ContentReportDrawer from './ContentReportDrawer';
import { REPORT_STATUS_COLORS, TARGET_TYPE_COLORS } from './contentReportView';

/** 默认只看待处理 */
const DEFAULT_STATUS = 1;

export default function ContentReportsPanel() {
  const t = useTranslations('admin.reports');
  const tReason = useTranslations('components.contentReport');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<number>(DEFAULT_STATUS);
  const [targetType, setTargetType] = useState<ContentReportTargetType | ''>(
    '',
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const openDrawer = (id: number | null) => {
    setNote('');
    setActiveId(id);
  };

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useAdminContentReports({ page, status, targetType });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  const statusLabel = (s: number) => t(`content.status_${s}`);

  const columns: ColumnsType<AdminContentReportItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: t('content.col_type'),
      dataIndex: 'target_type',
      key: 'target_type',
      render: (type: ContentReportTargetType) => (
        <Tag color={TARGET_TYPE_COLORS[type]}>{t(`content.type_${type}`)}</Tag>
      ),
    },
    {
      title: t('content.col_summary'),
      key: 'summary',
      width: 280,
      render: (_: unknown, record) =>
        record.target_deleted ? (
          <Typography.Text delete type="secondary">
            {t('content.target_deleted')}
          </Typography.Text>
        ) : (
          <Typography.Text
            ellipsis={{ tooltip: record.summary }}
            style={{ maxWidth: 260 }}
          >
            {record.summary}
          </Typography.Text>
        ),
    },
    {
      title: t('col_script'),
      key: 'script',
      render: (_: unknown, record) => (
        <Link href={`/script-show-page/${record.script_id}`} target="_blank">
          {record.script_name || `#${record.script_id}`}
        </Link>
      ),
    },
    {
      title: t('content.col_author'),
      key: 'author',
      render: (_: unknown, record) => (
        <Link href={`/users/${record.author_id}`} target="_blank">
          {record.author_name}
        </Link>
      ),
    },
    {
      title: t('col_reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Tag>{tReason(`reasons.${reason}.name`)}</Tag>
      ),
    },
    {
      title: t('col_reporter'),
      key: 'reporter',
      render: (_: unknown, record) => (
        <Link href={`/users/${record.user_id}`} target="_blank">
          {record.username}
        </Link>
      ),
    },
    {
      title: t('content.col_times'),
      dataIndex: 'pending_count',
      key: 'pending_count',
      width: 70,
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (val: number) => (
        <Tag color={REPORT_STATUS_COLORS[val]}>{statusLabel(val)}</Tag>
      ),
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
      render: (_: unknown, record) => (
        <Button type="link" size="small" onClick={() => openDrawer(record.id)}>
          {record.status === 1 ? t('content.action_handle') : t('action_view')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          aria-label={t('filter_status')}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          style={{ width: 140 }}
          options={[
            { value: 0, label: t('content.status_all') },
            { value: 1, label: statusLabel(1) },
            { value: 2, label: statusLabel(2) },
            { value: 3, label: statusLabel(3) },
          ]}
        />
        <Select
          aria-label={t('content.col_type')}
          value={targetType}
          onChange={(value) => {
            setTargetType(value);
            setPage(1);
          }}
          style={{ width: 140 }}
          options={[
            { value: '', label: t('content.type_all') },
            { value: 'score', label: t('content.type_score') },
            { value: 'issue', label: t('content.type_issue') },
            { value: 'issue_comment', label: t('content.type_issue_comment') },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={isLoading || isRefreshing}
        locale={tableLocale}
        pagination={{
          current: page,
          total,
          pageSize: ADMIN_PAGE_SIZE,
          showSizeChanger: false,
          onChange: setPage,
        }}
      />

      <ContentReportDrawer
        reportId={activeId}
        onClose={() => openDrawer(null)}
        note={note}
        onNoteChange={setNote}
        footer={(detail) => (
          <ContentReportActions
            detail={detail}
            note={note}
            onDone={() => openDrawer(null)}
          />
        )}
      />
    </div>
  );
}
