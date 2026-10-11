'use client';

import { useState } from 'react';
import { Button, message, Modal, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { PairWhitelistItem } from '@/lib/api/services/similarity';
import { similarityService } from '@/lib/api/services/similarity';
import { usePairWhitelist } from '@/lib/api/hooks/similarity';
import { APIError } from '@/types/api';
import { useTableStateLocale } from '../../components/tableState';

const PAGE_SIZE = 20;

export default function PairWhitelistTable() {
  const t = useTranslations('admin.similarity');
  const [page, setPage] = useState(1);

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = usePairWhitelist({ page, size: PAGE_SIZE });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  const handleRemove = (row: PairWhitelistItem) => {
    Modal.confirm({
      title: t('confirm_remove_whitelist'),
      onOk: async () => {
        try {
          await similarityService.removePairWhitelistByID(row.id);
          message.success(t('msg_removed'));
          refresh();
        } catch (err) {
          if (err instanceof APIError) message.error(err.msg);
        }
      },
    });
  };

  const columns: ColumnsType<PairWhitelistItem> = [
    { title: t('col_id'), dataIndex: 'id', width: 70 },
    {
      title: t('col_script_a'),
      render: (_, r) => (
        <Link href={`/script-show-page/${r.script_a.id}`}>
          {r.script_a.name}
        </Link>
      ),
    },
    {
      title: t('col_script_b'),
      render: (_, r) => (
        <Link href={`/script-show-page/${r.script_b.id}`}>
          {r.script_b.name}
        </Link>
      ),
    },
    { title: t('col_reason'), dataIndex: 'reason' },
    { title: t('col_added_by'), dataIndex: 'added_by_name' },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      render: (ts: number) => new Date(ts * 1000).toLocaleString(),
    },
    {
      title: t('col_actions'),
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            type="link"
            danger
            onClick={() => handleRemove(r)}
          >
            {t('action_remove')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={isLoading || isRefreshing}
      locale={tableLocale}
      pagination={{
        current: page,
        pageSize: PAGE_SIZE,
        total,
        onChange: setPage,
        showSizeChanger: false,
      }}
    />
  );
}
