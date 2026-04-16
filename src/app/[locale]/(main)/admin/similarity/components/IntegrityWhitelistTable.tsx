'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { IntegrityWhitelistItem } from '@/lib/api/services/similarity';
import { similarityService } from '@/lib/api/services/similarity';
import { APIError } from '@/types/api';

const PAGE_SIZE = 20;

export default function IntegrityWhitelistTable() {
  const t = useTranslations('admin.similarity');
  const [data, setData] = useState<IntegrityWhitelistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [form] = Form.useForm<{ script_id: number; reason: string }>();

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const resp = await similarityService.listIntegrityWhitelist({
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

  const handleRemove = (row: IntegrityWhitelistItem) => {
    Modal.confirm({
      title: t('confirm_remove_whitelist'),
      onOk: async () => {
        try {
          await similarityService.removeIntegrityWhitelist(row.script.id);
          message.success(t('msg_removed'));
          load(page);
        } catch (err) {
          if (err instanceof APIError) message.error(err.msg);
        }
      },
    });
  };

  const handleAdd = async () => {
    const values = await form.validateFields();
    setAddSubmitting(true);
    try {
      await similarityService.addIntegrityWhitelist(
        values.script_id,
        values.reason,
      );
      message.success(t('msg_whitelisted'));
      setAddOpen(false);
      form.resetFields();
      load(page);
    } catch (err) {
      if (err instanceof APIError) message.error(err.msg);
    } finally {
      setAddSubmitting(false);
    }
  };

  const columns: ColumnsType<IntegrityWhitelistItem> = [
    { title: t('col_id'), dataIndex: 'id', width: 70 },
    {
      title: t('col_script'),
      render: (_, r) => (
        <Link href={`/script-show-page/${r.script.id}`}>{r.script.name}</Link>
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
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setAddOpen(true)}>
          {t('btn_add')}
        </Button>
      </div>
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
      <Modal
        title={t('modal_add_int_whitelist')}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={handleAdd}
        confirmLoading={addSubmitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="script_id"
            label={t('label_script_id')}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label={t('label_reason')}
            rules={[{ required: true, max: 255 }]}
          >
            <Input.TextArea rows={3} maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
