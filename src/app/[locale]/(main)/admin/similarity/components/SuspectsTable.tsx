'use client';

import { useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { SuspectScriptItem } from '@/lib/api/services/similarity';
import { useSimilaritySuspects } from '@/lib/api/hooks/similarity';
import { useTableStateLocale } from '../../components/tableState';
import { AdminResponsiveList } from '../../components/AdminResponsiveList';
import type { AdminCardSpec } from '../../components/AdminResponsiveList';

const PAGE_SIZE = 20;

export default function SuspectsTable() {
  const t = useTranslations('admin.similarity');
  const [page, setPage] = useState(1);

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useSimilaritySuspects({ page, size: PAGE_SIZE });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  const formatIntegrity = (v?: number) => (v != null ? v.toFixed(2) : '-');

  const renderSources = (row: SuspectScriptItem) => (
    <ul>
      {row.top_sources.map((s) => (
        <li key={s.script_id}>
          <Link href={`/script-show-page/${s.script_id}`}>{s.script_name}</Link>
          {' — '}
          {'Jaccard '}
          {s.jaccard.toFixed(3)}
          {' / contrib '}
          {(s.contribution_pct * 100).toFixed(1)}
          {'%'}
        </li>
      ))}
    </ul>
  );

  const toCard = (r: SuspectScriptItem): AdminCardSpec => ({
    title: (
      <Link href={`/script-show-page/${r.script.id}`}>{r.script.name}</Link>
    ),
    // 嫌疑脚本没有独立 ID，主对象是脚本本身
    subtitle: [`#${r.script.id}`],
    body: <div className="[&_li]:truncate">{renderSources(r)}</div>,
    fields: [
      { label: t('col_max_jaccard'), value: r.max_jaccard.toFixed(3) },
      { label: t('col_coverage'), value: r.coverage.toFixed(3) },
      { label: t('col_pair_count'), value: r.pair_count },
      { label: t('col_integrity'), value: formatIntegrity(r.integrity_score) },
    ],
    time: r.detected_at,
  });

  const columns: ColumnsType<SuspectScriptItem> = [
    {
      title: t('col_script'),
      render: (_, r) => (
        <Link href={`/script-show-page/${r.script.id}`}>{r.script.name}</Link>
      ),
    },
    {
      title: t('col_max_jaccard'),
      dataIndex: 'max_jaccard',
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('col_coverage'),
      dataIndex: 'coverage',
      render: (v: number) => v.toFixed(3),
    },
    { title: t('col_pair_count'), dataIndex: 'pair_count' },
    {
      title: t('col_integrity'),
      dataIndex: 'integrity_score',
      render: formatIntegrity,
    },
    {
      title: t('col_detected_at'),
      dataIndex: 'detected_at',
      render: (ts: number) => new Date(ts * 1000).toLocaleString(),
    },
  ];

  return (
    <AdminResponsiveList<SuspectScriptItem>
      table={
        <Table
          rowKey={(record) => record.script.id}
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
          expandable={{ expandedRowRender: renderSources }}
        />
      }
      rows={data}
      rowKey={(record) => record.script.id}
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
    />
  );
}
