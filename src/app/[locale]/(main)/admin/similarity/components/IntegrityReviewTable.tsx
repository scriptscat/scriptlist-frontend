'use client';

import { useMemo, useState } from 'react';
import { Button, Drawer, message, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import MonacoEditor from '@/components/MonacoEditor';
import { Link } from '@/i18n/routing';
import { similarityService } from '@/lib/api/services/similarity';
import type {
  IntegrityReviewDetail,
  IntegrityReviewItem,
} from '@/lib/api/services/similarity';
import { useIntegrityReviews } from '@/lib/api/hooks/similarity';
import { APIError } from '@/types/api';
import { useTableStateLocale } from '../../components/tableState';
import ResolveReviewModal from './ResolveReviewModal';

const PAGE_SIZE = 20;

export default function IntegrityReviewTable() {
  const t = useTranslations('admin.similarity');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<IntegrityReviewDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<number | null>(null);

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useIntegrityReviews({ page, size: PAGE_SIZE });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  const openDetail = async (id: number) => {
    try {
      const resp = await similarityService.getIntegrityReview(id);
      setDetail(resp.detail);
      setDrawerOpen(true);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    }
  };

  const visibleData = useMemo(
    () => data.filter((r) => !r.script.is_deleted),
    [data],
  );

  const columns: ColumnsType<IntegrityReviewItem> = [
    { title: t('col_id'), dataIndex: 'id', width: 70 },
    {
      title: t('col_script'),
      render: (_, r) => (
        <Link href={`/script-show-page/${r.script.id}`}>{r.script.name}</Link>
      ),
    },
    {
      title: t('col_score'),
      dataIndex: 'score',
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      render: (s: number) => {
        const map: Record<number, { color: string; label: string }> = {
          0: { color: 'warning', label: t('review_pending') },
          1: { color: 'success', label: t('review_ok') },
          2: { color: 'error', label: t('review_violated') },
        };
        const m = map[s] ?? map[0];
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      render: (ts: number) => new Date(ts * 1000).toLocaleString(),
    },
    {
      title: t('col_actions'),
      render: (_, r) => (
        <Space>
          <Button size="small" type="link" onClick={() => openDetail(r.id)}>
            {t('action_detail')}
          </Button>
          {r.status === 0 && (
            <Button
              size="small"
              type="link"
              onClick={() => setResolveTarget(r.id)}
            >
              {t('action_resolve')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={visibleData}
        loading={isLoading || isRefreshing}
        locale={tableLocale}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: setPage,
        }}
      />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="large"
        title={t('drawer_review_detail')}
        destroyOnHidden
      >
        {detail && (
          <div>
            <Typography.Paragraph>
              <b>
                {t('label_score')}
                {':'}
              </b>{' '}
              {detail.score.toFixed(3)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <b>
                {t('label_sub_scores')}
                {':'}
              </b>{' '}
              {'A='}
              {detail.sub_scores.cat_a.toFixed(2)}
              {' B='}
              {detail.sub_scores.cat_b.toFixed(2)}
              {' C='}
              {detail.sub_scores.cat_c.toFixed(2)}
              {' D='}
              {detail.sub_scores.cat_d.toFixed(2)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <b>
                {t('label_hit_signals')}
                {':'}
              </b>
              <ul>
                {detail.hit_signals.map((h) => (
                  <li key={h.name}>
                    <b>
                      {t.has(`signal_desc.${h.name}`)
                        ? t(`signal_desc.${h.name}`)
                        : h.name}
                    </b>
                    <br />
                    <Typography.Text type="secondary">
                      {h.name}
                      {': '}
                      {h.value.toFixed(3)}
                      {' / '}
                      {h.threshold.toFixed(3)}
                    </Typography.Text>
                  </li>
                ))}
              </ul>
            </Typography.Paragraph>
            <MonacoEditor
              value={detail.code}
              language="javascript"
              readOnly
              height="400px"
            />
          </div>
        )}
      </Drawer>
      <ResolveReviewModal
        reviewID={resolveTarget}
        open={resolveTarget !== null}
        onClose={() => setResolveTarget(null)}
        onResolved={refresh}
      />
    </>
  );
}
