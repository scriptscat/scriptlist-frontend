'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, message, Modal, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { PairWhitelistItem } from '@/lib/api/services/similarity';
import { similarityService } from '@/lib/api/services/similarity';
import { APIError } from '@/types/api';

const PAGE_SIZE = 20;

export default function PairWhitelistTable() {
  const t = useTranslations('admin.similarity');
  const [data, setData] = useState<PairWhitelistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const resp = await similarityService.listPairWhitelist({
        page: p,
        size: PAGE_SIZE,
      });
      setData(resp.list ?? []);
      setTotal(resp.total ?? 0);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const handleRemove = (row: PairWhitelistItem) => {
    Modal.confirm({
      title: t('confirm_remove_whitelist'),
      onOk: async () => {
        try {
          await similarityService.removePairWhitelistByID(row.id);
          message.success(t('msg_removed'));
          load(page);
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
      loading={loading}
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
