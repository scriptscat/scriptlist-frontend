'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Input,
  message,
  Popconfirm,
  Select,
  Table,
  Tooltip,
} from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { CopyOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type { FeedbackItem } from '@/lib/api/services/admin';
import { copyToClipboard } from '@/lib/utils/utils';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';

const REASON_CODES = ['bug', 'unused', 'feature', 'better', 'other'] as const;

export default function FeedbacksClient() {
  const t = useTranslations('admin.feedbacks');
  const [data, setData] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [reason, setReason] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (p: number = page) => {
      setLoading(true);
      try {
        const resp = await adminService.listFeedbacks(
          p,
          20,
          keyword || undefined,
          reason || undefined,
          hideEmpty || undefined,
        );
        setData(resp.list || []);
        setTotal(resp.total);
      } catch (err) {
        if (err instanceof APIError) {
          message.error(err.msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, keyword, reason, hideEmpty],
  );

  useEffect(() => {
    fetchData(page);
  }, [page, keyword, reason, hideEmpty]);

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteFeedback(id);
      message.success(t('delete_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleCopy = (val: string) => {
    copyToClipboard(val)
      .then(() => message.success(t('copy_success')))
      .catch(() => message.error(t('copy_failed')));
  };

  const reasonLabel = (code: string) =>
    (REASON_CODES as readonly string[]).includes(code)
      ? t(`reasons.${code}`)
      : code;

  const columns: ColumnsType<FeedbackItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('col_reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (code: string) => reasonLabel(code),
    },
    {
      title: t('col_content'),
      dataIndex: 'content',
      key: 'content',
      render: (val: string) =>
        val ? (
          <div className="flex items-center gap-1">
            <Tooltip title={val}>
              <span className="block max-w-xs truncate">{val}</span>
            </Tooltip>
            <Tooltip title={t('copy')}>
              <Button
                type="text"
                size="small"
                className="flex-none"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(val)}
              />
            </Tooltip>
          </div>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      title: t('col_client_ip'),
      dataIndex: 'client_ip',
      key: 'client_ip',
      render: (ip: string, record: FeedbackItem) =>
        record.ip_location ? (
          <Tooltip title={record.ip_location}>
            <span>{ip}</span>
          </Tooltip>
        ) : (
          ip
        ),
    },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      key: 'createtime',
      render: (val: number) => new Date(val * 1000).toLocaleString(),
    },
    {
      title: t('col_actions'),
      key: 'actions',
      render: (_: unknown, record: FeedbackItem) => (
        <Popconfirm
          title={t('delete_confirm')}
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" size="small" danger>
            {t('action_delete')}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input.Search
          className="w-60"
          allowClear
          placeholder={t('search_content_placeholder')}
          defaultValue={keyword}
          onSearch={(value) => {
            setKeyword(value);
            setPage(1);
          }}
        />
        <Select
          className="w-40"
          value={reason}
          onChange={(value) => {
            setReason(value);
            setPage(1);
          }}
          options={[
            { value: '', label: t('reason_filter_all') },
            ...REASON_CODES.map((code) => ({
              value: code,
              label: t(`reasons.${code}`),
            })),
          ]}
        />
        <Checkbox
          checked={hideEmpty}
          onChange={(e: CheckboxChangeEvent) => {
            setHideEmpty(e.target.checked);
            setPage(1);
          }}
        >
          {t('hide_empty')}
        </Checkbox>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
        }}
      />
    </div>
  );
}
