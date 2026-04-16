'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Drawer, message, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import MonacoEditor from '@/components/MonacoEditor';
import { similarityService } from '@/lib/api/services/similarity';
import type {
  IntegrityReviewDetail,
  IntegrityReviewItem,
} from '@/lib/api/services/similarity';
import { APIError } from '@/types/api';
import ResolveReviewModal from './ResolveReviewModal';

const PAGE_SIZE = 20;

const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  avg_line_length: '平均行长度过长（代码可能被压缩为少量长行）',
  max_line_length: '最大行长度过长（存在超长代码行）',
  whitespace_ratio: '空白字符比例过低（代码缺少正常的空格和缩进）',
  comment_ratio: '注释比例过低（代码几乎没有注释）',
  single_char_ident_ratio: '单字符变量名比例过高（变量名被缩短为单个字符）',
  hex_ident_ratio: '十六进制变量名比例过高（使用了 _0x 开头的混淆变量名）',
  large_string_array: '检测到大型字符串数组（常见于混淆工具的字符串表）',
  dean_edwards_packer: '检测到 Dean Edwards 打包器',
  aa_encode: '检测到 AAEncode 编码',
  jj_encode: '检测到 JJEncode 编码',
  eval_density: 'eval/动态执行调用密度过高',
};

export default function IntegrityReviewTable() {
  const t = useTranslations('admin.similarity');
  const [data, setData] = useState<IntegrityReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<IntegrityReviewDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const resp = await similarityService.listIntegrityReviews({
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

  const openDetail = async (id: number) => {
    try {
      const resp = await similarityService.getIntegrityReview(id);
      setDetail(resp.detail);
      setDrawerOpen(true);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    }
  };

  const columns: ColumnsType<IntegrityReviewItem> = [
    { title: t('col_id'), dataIndex: 'id', width: 70 },
    { title: t('col_script'), render: (_, r) => r.script.name },
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
        dataSource={data}
        loading={loading}
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
              <b>{t('label_score')}:</b> {detail.score.toFixed(3)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <b>{t('label_sub_scores')}:</b> A=
              {detail.sub_scores.cat_a.toFixed(2)} B=
              {detail.sub_scores.cat_b.toFixed(2)} C=
              {detail.sub_scores.cat_c.toFixed(2)} D=
              {detail.sub_scores.cat_d.toFixed(2)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <b>{t('label_hit_signals')}:</b>
              <ul>
                {detail.hit_signals.map((h) => (
                  <li key={h.name}>
                    <b>{SIGNAL_DESCRIPTIONS[h.name] ?? h.name}</b>
                    <br />
                    <Typography.Text type="secondary">
                      {h.name}: {h.value.toFixed(3)} / {h.threshold.toFixed(3)}
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
        onResolved={() => load(page)}
      />
    </>
  );
}
