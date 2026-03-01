'use client';

import { Table, Tag, Card, Typography, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useScript } from '../../components/ScriptContext';
import type { AuditLogItem } from '@/lib/api/services/auditLog';
import { useScriptAuditLogList } from '@/lib/api/hooks/auditLog';
import { useSemDateTime } from '@/lib/utils/semdate';

const { Title, Text } = Typography;
const PAGE_SIZE = 20;

const ACTION_COLORS: Record<string, string> = {
  script_delete: 'red',
  script_update: 'blue',
  script_create: 'green',
};

export default function LogsPage() {
  const t = useTranslations('script.manage.logs');
  const tAudit = useTranslations('admin.audit_logs');
  const semDateTime = useSemDateTime();
  const script = useScript();

  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useScriptAuditLogList(script.script.id, {
    page: currentPage,
    size: PAGE_SIZE,
  });

  const getActionLabel = (action: string) => {
    const key = `actions.${action}`;
    return tAudit.has(key) ? tAudit(key) : action;
  };

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: tAudit('table.time'),
      dataIndex: 'createtime',
      key: 'createtime',
      width: 180,
      render: (val: number) => semDateTime(val),
    },
    {
      title: tAudit('table.operator'),
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string, record) => (
        <Link href={`/users/${record.user_id}`}>{username}</Link>
      ),
    },
    {
      title: tAudit('table.action'),
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
      title: tAudit('table.reason'),
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => reason || '-',
    },
  ];

  return (
    <Card className="shadow-sm">
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          {t('title')}
        </Title>
        <Text type="secondary">{t('log_description')}</Text>
      </div>

      <Table
        columns={columns}
        dataSource={data?.list ?? []}
        rowKey="id"
        loading={isLoading}
        locale={{
          emptyText: <Empty description={t('no_logs')} />,
        }}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onChange: setCurrentPage,
          showSizeChanger: false,
        }}
      />
    </Card>
  );
}
