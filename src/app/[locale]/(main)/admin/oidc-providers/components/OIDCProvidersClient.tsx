'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type { OIDCProviderItem } from '@/lib/api/services/admin';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';

export default function OIDCProvidersClient() {
  const t = useTranslations('admin.oidc_providers');
  const [data, setData] = useState<OIDCProviderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] =
    useState<OIDCProviderItem | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchData = useCallback(
    async (p: number = page) => {
      setLoading(true);
      try {
        const resp = await adminService.listOIDCProviders(p);
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
    [page],
  );

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleCreate = async (values: {
    name: string;
    issuer_url: string;
    client_id: string;
    client_secret: string;
    scopes: string;
    icon: string;
    display_order: number;
  }) => {
    try {
      await adminService.createOIDCProvider(values);
      setCreateModalOpen(false);
      createForm.resetFields();
      message.success(t('create_success'));
      fetchData(1);
      setPage(1);
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleEdit = async (values: {
    name: string;
    issuer_url: string;
    client_id: string;
    client_secret: string;
    scopes: string;
    icon: string;
    display_order: number;
    status: number;
  }) => {
    if (!editingProvider) return;
    try {
      await adminService.updateOIDCProvider(editingProvider.id, values);
      message.success(t('update_success'));
      setEditModalOpen(false);
      editForm.resetFields();
      setEditingProvider(null);
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteOIDCProvider(id);
      message.success(t('delete_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const openEdit = (provider: OIDCProviderItem) => {
    setEditingProvider(provider);
    editForm.setFieldsValue({
      name: provider.name,
      issuer_url: provider.issuer_url,
      client_id: provider.client_id,
      client_secret: '****',
      scopes: provider.scopes,
      icon: provider.icon,
      display_order: provider.display_order,
      status: provider.status,
    });
    setEditModalOpen(true);
  };

  const columns: ColumnsType<OIDCProviderItem> = [
    {
      title: t('col_name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('col_issuer_url'),
      dataIndex: 'issuer_url',
      key: 'issuer_url',
      ellipsis: true,
    },
    {
      title: t('col_client_id'),
      dataIndex: 'client_id',
      key: 'client_id',
      ellipsis: true,
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (val: number) =>
        val === 1 ? (
          <Tag color="green">{t('status_active')}</Tag>
        ) : (
          <Tag color="red">{t('status_disabled')}</Tag>
        ),
    },
    {
      title: t('col_actions'),
      key: 'actions',
      render: (_: unknown, record: OIDCProviderItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            {t('action_edit')}
          </Button>
          <Popconfirm
            title={t('delete_confirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              {t('action_delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formFields = (isEdit: boolean) => (
    <>
      <Form.Item
        name="name"
        label={t('field_name')}
        rules={[{ required: true, message: t('field_name_required') }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="issuer_url"
        label={t('field_issuer_url')}
        rules={[
          { required: true, message: t('field_issuer_url_required') },
          { type: 'url', message: t('field_issuer_url_invalid') },
        ]}
      >
        <Input placeholder="https://accounts.google.com" />
      </Form.Item>
      <Form.Item
        name="client_id"
        label={t('field_client_id')}
        rules={[{ required: true, message: t('field_client_id_required') }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="client_secret"
        label={t('field_client_secret')}
        rules={[
          {
            required: !isEdit,
            message: t('field_client_secret_required'),
          },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item name="scopes" label={t('field_scopes')}>
        <Input placeholder="openid,profile,email" />
      </Form.Item>
      <Form.Item name="icon" label={t('field_icon')}>
        <Input placeholder="https://example.com/icon.svg" />
      </Form.Item>
      <Form.Item name="display_order" label={t('field_display_order')}>
        <InputNumber min={0} />
      </Form.Item>
    </>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          {t('create_button')}
        </Button>
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

      {/* Create Modal */}
      <Modal
        title={t('create_title')}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          onFinish={handleCreate}
          layout="vertical"
          initialValues={{ display_order: 0 }}
        >
          {formFields(false)}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('create_button')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={t('edit_title')}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          editForm.resetFields();
          setEditingProvider(null);
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEdit} layout="vertical">
          {formFields(true)}
          <Form.Item name="status" label={t('field_status')}>
            <Select>
              <Select.Option value={1}>{t('status_active')}</Select.Option>
              <Select.Option value={2}>{t('status_disabled')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('save_button')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
