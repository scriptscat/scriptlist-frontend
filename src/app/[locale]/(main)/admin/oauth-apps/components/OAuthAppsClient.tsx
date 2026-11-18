'use client';

import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type {
  OAuthAppItem,
  CreateOAuthAppResponse,
} from '@/lib/api/services/admin';
import { useAdminOAuthApps } from '@/lib/api/hooks/admin';
import { APIError } from '@/types/api';
import { useTableStateLocale } from '../../components/tableState';
import type { ColumnsType } from 'antd/es/table';
import { AdminResponsiveList } from '../../components/AdminResponsiveList';
import type { AdminCardSpec } from '../../components/AdminResponsiveList';

const { Paragraph } = Typography;

function useRedirectUriValidator(t: ReturnType<typeof useTranslations>) {
  return (_: unknown, value: string) => {
    if (!value) return Promise.resolve();
    const lines = value.split('\n').filter((s: string) => s.trim());
    for (const line of lines) {
      try {
        const url = new URL(line.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return Promise.reject(new Error(t('field_redirect_uri_invalid')));
        }
      } catch {
        return Promise.reject(new Error(t('field_redirect_uri_invalid')));
      }
    }
    return Promise.resolve();
  };
}

function formatRedirectUri(val: string) {
  const uris = val.split('\n').filter((s: string) => s.trim());
  if (uris.length <= 1) return val;
  return `${uris[0]} (+${uris.length - 1})`;
}

export default function OAuthAppsClient() {
  const t = useTranslations('admin.oauth_apps');
  const validateRedirectUri = useRedirectUriValidator(t);
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<OAuthAppItem | null>(null);
  const [secretInfo, setSecretInfo] = useState<CreateOAuthAppResponse | null>(
    null,
  );
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const {
    list: data,
    total,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useAdminOAuthApps({ page });
  const tableLocale = useTableStateLocale({
    isLoading,
    error,
    onRetry: refresh,
  });

  // 创建成功后回到第一页；已经在第一页时 setPage 不会触发重新拉取，显式刷新一次。
  const fetchData = (p?: number) => {
    if (p !== undefined && p !== page) {
      setPage(p);
      return;
    }
    refresh();
  };

  const handleCreate = async (values: {
    name: string;
    description: string;
    redirect_uri: string;
  }) => {
    try {
      const resp = await adminService.createOAuthApp(values);
      setSecretInfo(resp);
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
    description: string;
    redirect_uri: string;
    status: number;
  }) => {
    if (!editingApp) return;
    try {
      await adminService.updateOAuthApp(editingApp.id, values);
      message.success(t('update_success'));
      setEditModalOpen(false);
      editForm.resetFields();
      setEditingApp(null);
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleResetSecret = async (id: number) => {
    try {
      const resp = await adminService.resetOAuthAppSecret(id);
      setSecretInfo(resp);
      message.success(t('reset_secret_success'));
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteOAuthApp(id);
      message.success(t('delete_success'));
      fetchData();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const openEdit = (app: OAuthAppItem) => {
    setEditingApp(app);
    editForm.setFieldsValue({
      name: app.name,
      description: app.description,
      redirect_uri: app.redirect_uri,
      status: app.status,
    });
    setEditModalOpen(true);
  };

  // 状态单元格（表格与窄屏卡片共用）
  const statusTag = (status: number) =>
    status === 1 ? (
      <Tag color="green">{t('status_active')}</Tag>
    ) : (
      <Tag color="red">{t('status_disabled')}</Tag>
    );

  const columns: ColumnsType<OAuthAppItem> = [
    {
      title: t('col_name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('col_client_id'),
      dataIndex: 'client_id',
      key: 'client_id',
      render: (val: string) => (
        <Paragraph copyable className="!mb-0">
          {val}
        </Paragraph>
      ),
    },
    {
      title: t('col_redirect_uri'),
      dataIndex: 'redirect_uri',
      key: 'redirect_uri',
      ellipsis: true,
      render: (val: string) => formatRedirectUri(val),
    },
    {
      title: t('col_status'),
      dataIndex: 'status',
      key: 'status',
      render: (val: number) => statusTag(val),
    },
    {
      title: t('col_actions'),
      key: 'actions',
      render: (_: unknown, record: OAuthAppItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            {t('action_edit')}
          </Button>
          <Popconfirm
            title={t('reset_secret_confirm')}
            onConfirm={() => handleResetSecret(record.id)}
          >
            <Button type="link" size="small">
              {t('reset_secret')}
            </Button>
          </Popconfirm>
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

  const toCard = (record: OAuthAppItem): AdminCardSpec => ({
    title: record.name,
    badges: statusTag(record.status),
    fields: [
      {
        label: t('col_client_id'),
        value: (
          <Paragraph copyable className="!mb-0 break-all">
            {record.client_id}
          </Paragraph>
        ),
      },
      {
        label: t('col_redirect_uri'),
        value: (
          <span className="break-all">
            {formatRedirectUri(record.redirect_uri)}
          </span>
        ),
      },
    ],
    actions: [
      { key: 'edit', label: t('action_edit'), onClick: () => openEdit(record) },
      {
        key: 'reset_secret',
        label: t('reset_secret'),
        confirm: { title: t('reset_secret_confirm') },
        onClick: () => handleResetSecret(record.id),
      },
      {
        key: 'delete',
        label: t('action_delete'),
        danger: true,
        confirm: { title: t('delete_confirm') },
        onClick: () => handleDelete(record.id),
      },
    ],
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          {t('create_button')}
        </Button>
      </div>

      <AdminResponsiveList<OAuthAppItem>
        table={
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={isLoading || isRefreshing}
            locale={tableLocale}
            pagination={{
              current: page,
              total,
              pageSize: 20,
              onChange: setPage,
            }}
          />
        }
        rows={data}
        rowKey="id"
        card={toCard}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={refresh}
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
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="name"
            label={t('field_name')}
            rules={[{ required: true, message: t('field_name_required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('field_description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="redirect_uri"
            label={t('field_redirect_uri')}
            extra={t('field_redirect_uri_hint')}
            rules={[
              { required: true, message: t('field_redirect_uri_required') },
              { validator: validateRedirectUri },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
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
          setEditingApp(null);
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEdit} layout="vertical">
          <Form.Item
            name="name"
            label={t('field_name')}
            rules={[{ required: true, message: t('field_name_required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('field_description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="redirect_uri"
            label={t('field_redirect_uri')}
            extra={t('field_redirect_uri_hint')}
            rules={[
              { required: true, message: t('field_redirect_uri_required') },
              { validator: validateRedirectUri },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
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

      {/* Secret Display Modal */}
      <Modal
        title={t('secret_title')}
        open={!!secretInfo}
        onCancel={() => setSecretInfo(null)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setSecretInfo(null)}>
            {t('secret_confirm')}
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-1">
              {'Client ID'}
            </p>
            <Paragraph copyable>{secretInfo?.client_id}</Paragraph>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-1">
              {'Client Secret'}
            </p>
            <Paragraph
              copyable={{
                icon: <CopyOutlined />,
              }}
            >
              {secretInfo?.client_secret}
            </Paragraph>
          </div>
          <p className="text-sm text-orange-500">{t('secret_warning')}</p>
        </div>
      </Modal>
    </div>
  );
}
