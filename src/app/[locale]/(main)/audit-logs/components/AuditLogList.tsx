'use client';

import { Table, Card, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import type { AuditLogItem } from '@/lib/api/services/auditLog';
import { useAuditLogList } from '@/lib/api/hooks/auditLog';
import { useResource } from '@/lib/api/hooks/useResource';
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

  const { data, isInitialLoading, isRefreshing } = useResource(
    useAuditLogList(swrParams),
    { hasInitialData: !paramsChanged },
  );

  // 旧代码在加载期间把 total 兜底成 0，分页器当场塌成一页、表格闪出「暂无数据」
  // 插画，用户直接丢失自己所在的位置。改成始终兜底到上一份成功的数据：
  // key 之间的切换由全局 `keepPreviousData` 兜住，而「null key → 第一个真实 key」
  // 这一跳的上一份数据正好就是 SSR 传进来的 initialList/initialTotal
  // （回到 initialPage 时 key 变回 null，兜底值同样正确）。
  const displayList = data?.list ?? initialList;
  const displayTotal = data?.total ?? initialTotal;
  const loading = isInitialLoading || isRefreshing;

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
          loading={loading}
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
