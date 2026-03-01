'use client';

import { Table, Tag, Select, Card, Typography, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { AuditLogItem } from '@/lib/api/services/auditLog';
import { useAuditLogList } from '@/lib/api/hooks/auditLog';
import { useSemDateTime } from '@/lib/utils/semdate';

const { Title, Text } = Typography;
const PAGE_SIZE = 20;

interface AuditLogListProps {
  initialPage: number;
  initialAction: string;
  initialList: AuditLogItem[];
  initialTotal: number;
}

const ACTION_COLORS: Record<string, string> = {
  script_delete: 'red',
  script_update: 'blue',
  script_create: 'green',
};

export default function AuditLogList({
  initialPage,
  initialAction,
  initialList,
  initialTotal,
}: AuditLogListProps) {
  const t = useTranslations('admin.audit_logs');
  const semDateTime = useSemDateTime();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentAction, setCurrentAction] = useState(initialAction);

  const paramsChanged =
    currentPage !== initialPage || currentAction !== initialAction;

  const swrParams = paramsChanged
    ? {
        page: currentPage,
        size: PAGE_SIZE,
        action: currentAction || undefined,
      }
    : null;

  const { data, isLoading } = useAuditLogList(swrParams);

  const displayList = paramsChanged ? (data?.list ?? []) : initialList;
  const displayTotal = paramsChanged ? (data?.total ?? 0) : initialTotal;

  const getActionLabel = (action: string) => {
    const key = `actions.${action}`;
    return t.has(key) ? t(key) : action;
  };

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: t('table.time'),
      dataIndex: 'createtime',
      key: 'createtime',
      width: 180,
      render: (val: number) => semDateTime(val),
    },
    {
      title: t('table.operator'),
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string, record) => (
        <Link href={`/users/${record.user_id}`}>{username}</Link>
      ),
    },
    {
      title: t('table.action'),
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string) => (
        <Tag color={ACTION_COLORS[action] || 'default'}>
          {getActionLabel(action)}
        </Tag>
      ),
    },
    {
      title: t('table.target'),
      key: 'target',
      width: 250,
      render: (_, record) => (
        <Link href={`/script-show-page/${record.target_id}`}>
          {record.target_name || `#${record.target_id}`}
        </Link>
      ),
    },
    {
      title: t('table.reason'),
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => reason || '-',
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.history.replaceState(
      null,
      '',
      `?page=${page}${currentAction ? `&action=${currentAction}` : ''}`,
    );
  };

  const handleActionChange = (value: string) => {
    setCurrentAction(value);
    setCurrentPage(1);
    window.history.replaceState(
      null,
      '',
      `?page=1${value ? `&action=${value}` : ''}`,
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Card className="shadow-sm">
        <div className="mb-6">
          <Title level={3} className="!mb-1">
            {t('title')}
          </Title>
          <Text type="secondary">{t('description')}</Text>
        </div>

        <Space className="mb-4">
          <Text>{t('filter.action')}:</Text>
          <Select
            className="w-48"
            value={currentAction}
            onChange={handleActionChange}
            options={[
              { value: '', label: t('filter.all') },
              {
                value: 'script_delete',
                label: t('actions.script_delete'),
              },
              {
                value: 'script_update',
                label: t('actions.script_update'),
              },
              {
                value: 'script_create',
                label: t('actions.script_create'),
              },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={displayList}
          rowKey="id"
          loading={paramsChanged && isLoading}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total: displayTotal,
            onChange: handlePageChange,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
}
