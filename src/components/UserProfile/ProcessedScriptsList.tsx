'use client';

import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Empty, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from '@/i18n/routing';
import type { ProcessedScriptItem } from '@/lib/api/services/admin';
import { adminService } from '@/lib/api/services/admin';
import { useSemDateTime } from '@/lib/utils/semdate';

interface ProcessedScriptsListProps {
  userId: number;
  shouldFetch?: boolean;
  pageSize?: number;
}

const { Text } = Typography;

export default function ProcessedScriptsList({
  userId,
  shouldFetch = true,
  pageSize = 10,
}: ProcessedScriptsListProps) {
  const t = useTranslations('user.profile');
  const semDateTime = useSemDateTime();

  const { data, isLoading } = useSWR(
    shouldFetch ? ['admin-user-processed-scripts', userId, pageSize] : null,
    () =>
      adminService.listUserProcessedScripts(userId, {
        page: 1,
        size: pageSize,
      }),
    { revalidateOnFocus: false },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spin />
      </div>
    );
  }

  if (!data || data.list.length === 0) {
    return <Empty description={t('processed_empty')} />;
  }

  const columns: ColumnsType<ProcessedScriptItem> = [
    {
      title: t('processed_col_action'),
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: string) => {
        if (action === 'script_delete') {
          return <Tag color="red">{t('processed_action_delete')}</Tag>;
        }
        if (action === 'script_audit_rejected') {
          return <Tag color="orange">{t('processed_action_rejected')}</Tag>;
        }
        return <Tag>{action}</Tag>;
      },
    },
    {
      title: t('processed_col_script'),
      dataIndex: 'script_name',
      key: 'script_name',
      render: (name: string, row: ProcessedScriptItem) => (
        <Link href={`/script-show-page/${row.script_id}`} target="_blank">
          {name || `#${row.script_id}`}
        </Link>
      ),
    },
    {
      title: t('processed_col_operator'),
      dataIndex: 'operator_name',
      key: 'operator',
      width: 120,
    },
    {
      title: t('processed_col_time'),
      dataIndex: 'createtime',
      key: 'createtime',
      width: 140,
      render: (ts: number) => semDateTime(ts),
    },
    {
      title: t('processed_col_reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) =>
        reason ? (
          <Text type="secondary" ellipsis={{ tooltip: reason }}>
            {reason}
          </Text>
        ) : (
          <Text type="secondary">{'-'}</Text>
        ),
    },
  ];

  return (
    <Table<ProcessedScriptItem>
      size="small"
      rowKey="id"
      columns={columns}
      dataSource={data.list}
      pagination={false}
    />
  );
}
