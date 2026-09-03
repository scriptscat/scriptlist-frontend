'use client';

import { useState } from 'react';
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
import { useIntegrityWhitelist } from '@/lib/api/hooks/similarity';
import { APIError } from '@/types/api';
import { useTableStateLocale } from '../../components/tableState';

const PAGE_SIZE = 20;

export default function IntegrityWhitelistTable() {
  const t = useTranslations('admin.similarity');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [form] = Form.useForm<{ script_id: number; reason: string }>();

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useIntegrityWhitelist({ page, size: PAGE_SIZE });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  const handleRemove = (row: IntegrityWhitelistItem) => {
    Modal.confirm({
      title: t('confirm_remove_whitelist'),
      onOk: async () => {
        try {
          await similarityService.removeIntegrityWhitelist(row.script.id);
          message.success(t('msg_removed'));
          refresh();
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
      refresh();
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
