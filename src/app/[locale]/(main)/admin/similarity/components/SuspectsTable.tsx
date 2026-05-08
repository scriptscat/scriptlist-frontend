'use client';

import { useCallback, useEffect, useState } from 'react';
import { message, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { similarityService } from '@/lib/api/services/similarity';
import type { SuspectScriptItem } from '@/lib/api/services/similarity';
import { APIError } from '@/types/api';

const PAGE_SIZE = 20;

export default function SuspectsTable() {
  const t = useTranslations('admin.similarity');
  const [data, setData] = useState<SuspectScriptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const resp = await similarityService.listSuspects({
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
      render: (v?: number) => (v != null ? v.toFixed(2) : '-'),
    },
    {
      title: t('col_detected_at'),
      dataIndex: 'detected_at',
      render: (ts: number) => new Date(ts * 1000).toLocaleString(),
    },
  ];

  return (
    <Table
      rowKey={(record) => record.script.id}
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
      expandable={{
        expandedRowRender: (row) => (
          <ul>
            {row.top_sources.map((s) => (
              <li key={s.script_id}>
                <Link href={`/script-show-page/${s.script_id}`}>
                  {s.script_name}
                </Link>
                {' — '}Jaccard {s.jaccard.toFixed(3)} / contrib{' '}
                {(s.contribution_pct * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        ),
      }}
    />
  );
}
