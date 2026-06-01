'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  InputNumber,
  List,
  message,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAIReviews } from '@/lib/api/hooks/useAIReviews';
import {
  aiReviewService,
  type AIReviewDetail,
  type AIReviewItem,
} from '@/lib/api/services/aiReview';
import { APIError } from '@/types/api';

const statusColors: Record<number, string> = {
  0: 'blue',
  1: 'green',
  2: 'red',
  3: 'orange',
  4: 'volcano',
  5: 'default',
};

const STATUS_OPTIONS = [0, 1, 2, 3, 4, 5];

interface RiskSignal {
  name?: string;
  severity?: string;
  evidence_line?: number | null;
}

function parseJSONList<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function formatLatency(latencyMs: number): string {
  return `${Number((latencyMs / 1000).toFixed(2))}s`;
}

export default function AIReviewRecordsClient() {
  const t = useTranslations('admin.ai_review');
  const [form] = Form.useForm<{
    status?: number;
    script_id?: number;
  }>();
  const [filters, setFilters] = useState<{
    status?: number;
    script_id?: number;
  }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailID, setDetailID] = useState<number | null>(null);
  const [detail, setDetail] = useState<AIReviewDetail | null>(null);

  const params = useMemo(
    () => ({ ...filters, page, size: pageSize }),
    [filters, page, pageSize],
  );

  const { data, isLoading } = useAIReviews(params);

  useEffect(() => {
    if (detailID === null) return;
    let cancelled = false;
    aiReviewService
      .getRecord(detailID)
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof APIError) {
          message.error(err.msg);
        } else {
          message.error(t('detail_load_failed'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [detailID, t]);

  const riskSignals = useMemo(
    () => parseJSONList<RiskSignal>(detail?.risk_signals),
    [detail?.risk_signals],
  );
  const noisyLines = useMemo(
    () => parseJSONList<number>(detail?.noisy_lines),
    [detail?.noisy_lines],
  );

  const openDetail = (id: number) => {
    setDetail(null);
    setDetailID(id);
  };

  const closeDetail = () => {
    setDetailID(null);
    setDetail(null);
  };

  const statusFilterOptions = STATUS_OPTIONS.map((v) => ({
    text: t(`status_${v}` as const),
    value: v,
  }));

  const handleTableChange: TableProps<AIReviewItem>['onChange'] = (
    pagination,
    tableFilters,
  ) => {
    const nextStatus = tableFilters.status?.[0];
    const parsedStatus =
      nextStatus === undefined ? undefined : Number(nextStatus);
    const status =
      parsedStatus === undefined || !Number.isFinite(parsedStatus)
        ? undefined
        : parsedStatus;
    setFilters((prev) => ({ ...prev, status }));
    form.setFieldValue('status', status);
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || pageSize);
  };

  const columns: ColumnsType<AIReviewItem> = [
    { title: t('col_id'), dataIndex: 'id', width: 80 },
    {
      title: t('col_script'),
      key: 'script',
      width: 240,
      ellipsis: true,
      render: (_: unknown, row) => (
        <Link href={`/script-show-page/${row.script_id}`}>
          {row.script_name || `#${row.script_id}`}
        </Link>
      ),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      width: 120,
      filters: statusFilterOptions,
      filterMultiple: false,
      filteredValue: filters.status === undefined ? null : [filters.status],
      filtered: filters.status !== undefined,
      render: (v: number) => (
        <Tag color={statusColors[v]}>{t(`status_${v}` as const)}</Tag>
      ),
    },
    { title: t('col_model'), dataIndex: 'model', width: 160, ellipsis: true },
    {
      title: t('col_tokens'),
      width: 120,
      render: (_: unknown, r: AIReviewItem) =>
        `${r.prompt_tokens}/${r.completion_tokens}`,
    },
    {
      title: t('col_latency'),
      dataIndex: 'latency_ms',
      width: 100,
      render: (v: number) => formatLatency(v),
    },
    { title: t('col_reason'), dataIndex: 'reason', ellipsis: true },
    {
      title: t('col_time'),
      dataIndex: 'createtime',
      width: 180,
      render: (v: number) => new Date(v * 1000).toLocaleString(),
    },
    {
      title: t('col_action'),
      width: 100,
      render: (_: unknown, r: AIReviewItem) => (
        <Button type="link" onClick={() => openDetail(r.id)}>
          {t('view_detail')}
        </Button>
      ),
    },
  ];

  return (
    <Card title={t('title')}>
      <Form
        form={form}
        layout="inline"
        onValuesChange={(_, all) => {
          setFilters({
            status: all.status ?? undefined,
            script_id: all.script_id ?? undefined,
          });
          setPage(1);
        }}
        style={{ marginBottom: 16 }}
      >
        <Form.Item name="status" label={t('filter_status')}>
          <Select
            allowClear
            placeholder={t('filter_status')}
            options={STATUS_OPTIONS.map((v) => ({
              value: v,
              label: t(`status_${v}` as const),
            }))}
            style={{ width: 160 }}
          />
        </Form.Item>
        <Form.Item name="script_id" label="script_id">
          <InputNumber style={{ width: 140 }} min={1} />
        </Form.Item>
      </Form>
      <Table<AIReviewItem>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.list ?? []}
        pagination={{
          total: data?.total ?? 0,
          current: page,
          pageSize,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
      <Drawer
        open={detailID !== null}
        onClose={closeDetail}
        width={720}
        title={t('view_detail')}
      >
        <Spin spinning={detailID !== null && detail?.id !== detailID}>
          {detail ? (
            <Space direction="vertical" size={20} className="w-full">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={t('col_id')}>
                  {detail.id}
                </Descriptions.Item>
                <Descriptions.Item label={t('col_script')}>
                  <Link href={`/script-show-page/${detail.script_id}`}>
                    {detail.script_name || `#${detail.script_id}`}
                  </Link>
                </Descriptions.Item>
                <Descriptions.Item label={t('col_status')}>
                  <Tag color={statusColors[detail.status]}>
                    {t(`status_${detail.status}` as const)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('col_model')}>
                  {detail.model || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('col_tokens')}>
                  {`${detail.prompt_tokens}/${detail.completion_tokens}`}
                </Descriptions.Item>
                <Descriptions.Item label={t('col_latency')}>
                  {formatLatency(detail.latency_ms)}
                </Descriptions.Item>
                <Descriptions.Item label={t('detail_audit_id')}>
                  {detail.script_audit_id || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('col_reason')}>
                  <Typography.Paragraph className="!mb-0" copyable>
                    {detail.reason || '-'}
                  </Typography.Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label={t('tags_title')}>
                  {detail.tags.length ? (
                    <Space wrap>
                      {detail.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('detail_last_error')}>
                  <Typography.Paragraph className="!mb-0" copyable>
                    {detail.last_error || '-'}
                  </Typography.Paragraph>
                </Descriptions.Item>
              </Descriptions>

              <section>
                <Typography.Title level={5}>
                  {t('risk_signals_title')}
                </Typography.Title>
                {riskSignals.length ? (
                  <List
                    bordered
                    size="small"
                    dataSource={riskSignals}
                    renderItem={(item) => (
                      <List.Item>
                        <Space wrap>
                          <Tag color="red">{item.severity || '-'}</Tag>
                          <Typography.Text strong>
                            {item.name || '-'}
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            {item.evidence_line
                              ? t('evidence_line', {
                                  line: item.evidence_line,
                                })
                              : t('evidence_line_none')}
                          </Typography.Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </section>

              <section>
                <Typography.Title level={5}>
                  {t('noisy_lines_title')}
                </Typography.Title>
                {noisyLines.length ? (
                  <Typography.Paragraph copyable>
                    {noisyLines.join(', ')}
                  </Typography.Paragraph>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </section>
            </Space>
          ) : null}
        </Spin>
      </Drawer>
    </Card>
  );
}
