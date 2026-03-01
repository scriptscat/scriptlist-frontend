'use client';

import { Table, Card, Typography } from 'antd';
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
  initialList: AuditLogItem[];
  initialTotal: number;
}

export default function AuditLogList({
  initialPage,
  initialList,
  initialTotal,
}: AuditLogListProps) {
  const t = useTranslations('admin.audit_logs');
  const semDateTime = useSemDateTime();

  const [currentPage, setCurrentPage] = useState(initialPage);

  const paramsChanged = currentPage !== initialPage;

  const swrParams = paramsChanged
    ? {
        page: currentPage,
        size: PAGE_SIZE,
      }
    : null;

  const { data, isLoading } = useAuditLogList(swrParams);

  const displayList = paramsChanged ? (data?.list ?? []) : initialList;
  const displayTotal = paramsChanged ? (data?.total ?? 0) : initialTotal;

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
    window.history.replaceState(null, '', `?page=${page}`);
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
