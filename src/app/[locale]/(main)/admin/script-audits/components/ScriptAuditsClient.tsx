'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { useTranslations } from 'next-intl';
import type { ColumnsType } from 'antd/es/table';
import { adminService } from '@/lib/api/services/admin';
import type {
  ScriptAuditDetail,
  ScriptAuditItem,
} from '@/lib/api/services/admin';
import { APIError } from '@/types/api';

const STATUS_PENDING = 1;
const STATUS_APPROVED = 2;
const STATUS_REJECTED = 3;

type StatusFilter = 0 | 1 | 2 | 3; // 0 = all

export default function ScriptAuditsClient() {
  const t = useTranslations('admin.script_audits');
  const [data, setData] = useState<ScriptAuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(STATUS_PENDING);
  const [loading, setLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ScriptAuditDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectForm] = Form.useForm<{ reason: string }>();
  const [submitting, setSubmitting] = useState(false);

  const statusFilterParam = useMemo(
    () => (statusFilter === 0 ? undefined : statusFilter),
    [statusFilter],
  );

  const fetchList = useCallback(
    async (p: number = page) => {
      setLoading(true);
      try {
        const resp = await adminService.listScriptAudits(
          p,
          size,
          statusFilterParam,
        );
        setData(resp.list || []);
        setTotal(resp.total);
      } catch (err) {
        if (err instanceof APIError) message.error(err.msg);
      } finally {
        setLoading(false);
      }
    },
    [page, size, statusFilterParam],
  );

  useEffect(() => {
    fetchList(page);
  }, [page, statusFilter, fetchList]);

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const resp = await adminService.getScriptAudit(id);
      setDetail(resp);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setSubmitting(true);
    try {
      await adminService.approveScriptAudit(detail.id);
      message.success(t('approve_success'));
      setDetailOpen(false);
      fetchList(page);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openReject = () => {
    rejectForm.resetFields();
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!detail) return;
    const values = await rejectForm.validateFields();
    setSubmitting(true);
    try {
      await adminService.rejectScriptAudit(detail.id, values.reason);
      message.success(t('reject_success'));
      setRejectOpen(false);
      setDetailOpen(false);
      fetchList(page);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusTag = (status: number) => {
    if (status === STATUS_PENDING)
      return <Tag color="orange">{t('status_pending')}</Tag>;
    if (status === STATUS_APPROVED)
      return <Tag color="green">{t('status_approved')}</Tag>;
    if (status === STATUS_REJECTED)
      return <Tag color="red">{t('status_rejected')}</Tag>;
    return <Tag>{status}</Tag>;
  };

  const columns: ColumnsType<ScriptAuditItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: t('col_script'),
      key: 'script',
      render: (_, row) => (
        <a
          href={`/script-show-page/${row.script_id}`}
          target="_blank"
          rel="noreferrer"
        >
          {row.script_name || `#${row.script_id}`}
        </a>
      ),
    },
    {
      title: t('col_version'),
      dataIndex: 'version',
      key: 'version',
      width: 120,
    },
    {
      title: t('col_submitter'),
      key: 'submitter',
      render: (_, row) => (
        <span>
          {row.submitter || `#${row.submitter_id}`}{' '}
          <Tag color="blue">{row.submitter_credit}</Tag>
        </span>
      ),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => statusTag(s),
      width: 100,
    },
    {
      title: t('col_createtime'),
      dataIndex: 'createtime',
      key: 'createtime',
      width: 170,
      render: (v: number) => new Date(v * 1000).toLocaleString(),
    },
    {
      title: t('col_actions'),
      key: 'actions',
      width: 100,
      render: (_, row) => (
        <Button type="link" onClick={() => openDetail(row.id)}>
          {t('action_review')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <span>{t('filter_status')}:</span>
        <Select<StatusFilter>
          value={statusFilter}
          style={{ width: 140 }}
          onChange={(v) => {
            setPage(1);
            setStatusFilter(v);
          }}
          options={[
            { value: 0, label: t('filter_all') },
            { value: STATUS_PENDING, label: t('status_pending') },
            { value: STATUS_APPROVED, label: t('status_approved') },
            { value: STATUS_REJECTED, label: t('status_rejected') },
          ]}
        />
        <Button onClick={() => fetchList(page)}>{t('refresh')}</Button>
      </Space>
      <Table<ScriptAuditItem>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize: size,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />

      <Drawer
        title={t('drawer_title')}
        width={Math.min(
          960,
          typeof window !== 'undefined' ? window.innerWidth - 80 : 960,
        )}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnHidden
        loading={detailLoading}
        extra={
          detail && detail.status === STATUS_PENDING ? (
            <Space>
              <Button danger onClick={openReject} disabled={submitting}>
                {t('action_reject')}
              </Button>
              <Button
                type="primary"
                onClick={handleApprove}
                loading={submitting}
              >
                {t('action_approve')}
              </Button>
            </Space>
          ) : null
        }
      >
        {detail && (
          <div className="space-y-4">
            <div>
              <b>{t('detail_script')}:</b>{' '}
              <a
                href={`/script-show-page/${detail.script_id}`}
                target="_blank"
                rel="noreferrer"
              >
                {detail.script_name || `#${detail.script_id}`}
              </a>{' '}
              <Tag>{detail.version}</Tag>
              {statusTag(detail.status)}
            </div>
            <div>
              <b>{t('detail_submitter')}:</b>{' '}
              {detail.submitter || `#${detail.submitter_id}`}{' '}
              <Tag color="blue">
                {t('detail_credit')}: {detail.submitter_credit}
              </Tag>
            </div>
            {detail.changelog && (
              <div>
                <b>{t('detail_changelog')}:</b>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-zinc-800 p-3 rounded">
                  {detail.changelog}
                </pre>
              </div>
            )}
            {detail.status === STATUS_REJECTED && detail.reason && (
              <div>
                <b>{t('detail_reject_reason')}:</b>
                <pre className="whitespace-pre-wrap text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  {detail.reason}
                </pre>
              </div>
            )}
            <div>
              <b>{t('detail_code')}:</b>
              <pre className="text-xs bg-gray-50 dark:bg-zinc-800 p-3 rounded max-h-[60vh] overflow-auto">
                {detail.code}
              </pre>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title={t('reject_modal_title')}
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={handleReject}
        confirmLoading={submitting}
        okButtonProps={{ danger: true }}
        okText={t('action_reject')}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label={t('reject_reason_label')}
            rules={[{ required: true, message: t('reject_reason_required') }]}
          >
            <Input.TextArea
              rows={4}
              placeholder={t('reject_reason_placeholder')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
