'use client';

import { useMemo, useState } from 'react';
import { Button, Select, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type {
  ScriptBrief,
  SimilarPairItem,
} from '@/lib/api/services/similarity';
import { useSimilarityPairs } from '@/lib/api/hooks/similarity';
import { useTableStateLocale } from '../../components/tableState';
import { AdminResponsiveList } from '../../components/AdminResponsiveList';
import type { AdminCardSpec } from '../../components/AdminResponsiveList';

const PAGE_SIZE = 20;
const SORT_DEFAULT = 'default';
type JaccardSort = 'asc' | 'desc';

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
  // 表头 Jaccard 排序（仅当前页）在窄屏改为工具栏下拉框，排序结果与表头一致
  const [jaccardSort, setJaccardSort] = useState<JaccardSort | undefined>();
  const tCard = useTranslations('admin.card');

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

  const cardRows = useMemo(() => {
    if (!jaccardSort) return data;
    const dir = jaccardSort === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => (a.jaccard - b.jaccard) * dir);
  }, [data, jaccardSort]);

  const statusTag = (s: number) => {
    const map: Record<number, { color: string; label: string }> = {
      0: { color: 'warning', label: t('status_pending') },
      1: { color: 'default', label: t('status_whitelisted') },
      2: { color: 'success', label: t('status_resolved') },
    };
    const m = map[s] ?? map[0];
    return <Tag color={m.color}>{m.label}</Tag>;
  };
  const earlierTag = (s: string) => (
    <Tag color={s === 'same' ? 'default' : 'blue'}>{s}</Tag>
  );
  const formatIntegrity = (v?: number) => (v != null ? v.toFixed(2) : '-');

  const toCard = (r: SimilarPairItem): AdminCardSpec => ({
    title: (
      <>
        <ScriptCell script={r.script_a} deletedLabel={deletedLabel} />
        {' ↔ '}
        <ScriptCell script={r.script_b} deletedLabel={deletedLabel} />
      </>
    ),
    subtitle: [`#${r.id}`],
    badges: (
      <>
        {statusTag(r.status)}
        {earlierTag(r.earlier_side)}
      </>
    ),
    fields: [
      { label: t('col_jaccard'), value: r.jaccard.toFixed(3) },
      { label: t('col_common'), value: r.common_count },
      { label: t('col_integrity'), value: formatIntegrity(r.integrity_score) },
    ],
    actions: [
      {
        key: 'detail',
        label: t('action_detail'),
        href: `/admin/similarity/pairs/${r.id}`,
      },
    ],
  });

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
      render: earlierTag,
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      render: statusTag,
    },
    {
      title: t('col_integrity'),
      dataIndex: 'integrity_score',
      render: formatIntegrity,
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
      <AdminResponsiveList<SimilarPairItem>
        table={
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
        }
        rows={cardRows}
        rowKey="id"
        card={toCard}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={refresh}
        pagination={{
          current: page,
          total,
          pageSize: PAGE_SIZE,
          onChange: setPage,
        }}
        mobileToolbar={
          <Select<string>
            aria-label={tCard('sort')}
            value={jaccardSort ?? SORT_DEFAULT}
            onChange={(v) =>
              setJaccardSort(
                v === SORT_DEFAULT ? undefined : (v as JaccardSort),
              )
            }
            className="!w-full"
            options={[
              { value: SORT_DEFAULT, label: tCard('sort_default') },
              {
                value: 'desc',
                label: tCard('sort_desc', { field: t('col_jaccard') }),
              },
              {
                value: 'asc',
                label: tCard('sort_asc', { field: t('col_jaccard') }),
              },
            ]}
          />
        }
      />
    </Space>
  );
}
