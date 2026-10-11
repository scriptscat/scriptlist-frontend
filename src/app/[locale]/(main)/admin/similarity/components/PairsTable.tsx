'use client';

import { useState } from 'react';
import { Button, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type {
  ScriptBrief,
  SimilarPairItem,
} from '@/lib/api/services/similarity';
import { useSimilarityPairs } from '@/lib/api/hooks/similarity';
import { useTableStateLocale } from '../../components/tableState';

const PAGE_SIZE = 20;

function ScriptCell({
  script,
  deletedLabel,
}: {
  script: ScriptBrief;
  deletedLabel: string;
}) {
  return (
    <Space size={4}>
      <Link
        href={`/script-show-page/${script.id}`}
        className={script.is_deleted ? 'line-through text-neutral-500' : ''}
      >
        {script.name}
      </Link>
      {script.is_deleted ? <Tag color="red">{deletedLabel}</Tag> : null}
    </Space>
  );
}

export default function PairsTable() {
  const t = useTranslations('admin.similarity');
  const [page, setPage] = useState(1);
  const [excludeDeleted, setExcludeDeleted] = useState(false);

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useSimilarityPairs({ page, size: PAGE_SIZE, excludeDeleted });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  const deletedLabel = t('script_deleted');

  const columns: ColumnsType<SimilarPairItem> = [
    { title: t('col_id'), dataIndex: 'id', width: 70 },
    {
      title: t('col_script_a'),
      render: (_, r) => (
        <ScriptCell script={r.script_a} deletedLabel={deletedLabel} />
      ),
    },
    {
      title: t('col_script_b'),
      render: (_, r) => (
        <ScriptCell script={r.script_b} deletedLabel={deletedLabel} />
      ),
    },
    {
      title: t('col_jaccard'),
      dataIndex: 'jaccard',
      render: (v: number) => v.toFixed(3),
      sorter: (a, b) => a.jaccard - b.jaccard,
    },
    { title: t('col_common'), dataIndex: 'common_count' },
    {
      title: t('col_earlier'),
      dataIndex: 'earlier_side',
      render: (s: string) => (
        <Tag color={s === 'same' ? 'default' : 'blue'}>{s}</Tag>
      ),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      render: (s: number) => {
        const map: Record<number, { color: string; label: string }> = {
          0: { color: 'warning', label: t('status_pending') },
          1: { color: 'default', label: t('status_whitelisted') },
          2: { color: 'success', label: t('status_resolved') },
        };
        const m = map[s] ?? map[0];
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: t('col_integrity'),
      dataIndex: 'integrity_score',
      render: (v?: number) => (v != null ? v.toFixed(2) : '-'),
    },
    {
      title: t('col_actions'),
      render: (_, r) => (
        <Space>
          <Link href={`/admin/similarity/pairs/${r.id}`}>
            <Button size="small" type="link">
              {t('action_detail')}
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" className="w-full">
      <Space>
        <span>{t('filter_exclude_deleted')}</span>
        <Switch
          checked={excludeDeleted}
          onChange={(v) => {
            setPage(1);
            setExcludeDeleted(v);
          }}
        />
      </Space>
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
    </Space>
  );
}
