'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { adminService } from '@/lib/api/services/admin';
import type {
  OIDCProviderItem,
  CreateOIDCProviderRequest,
  UpdateOIDCProviderRequest,
} from '@/lib/api/services/admin';
import { APIError } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';
import { API_CONFIG } from '@/lib/api/config';

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
  const [discovering, setDiscovering] = useState(false);
  const [createIconUrl, setCreateIconUrl] = useState<string>('');
  const [editIconUrl, setEditIconUrl] = useState<string>('');
  const [createType, setCreateType] = useState<string>('oidc');
  const [editType, setEditType] = useState<string>('oidc');

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

  const handleDiscover = async (form: ReturnType<typeof Form.useForm>[0]) => {
    const issuerUrl = form.getFieldValue('issuer_url');
    if (!issuerUrl) {
      message.warning(t('field_issuer_url_required'));
      return;
    }
    setDiscovering(true);
    try {
      const config = await adminService.discoverOIDCConfig(issuerUrl);
      form.setFieldsValue({
        issuer_url: config.issuer || issuerUrl,
        scopes: config.scopes_supported || 'openid,profile,email',
      });
      message.success(t('discover_success'));
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('discover_failed'));
      }
    } finally {
      setDiscovering(false);
    }
  };

  const handleIconUpload = async (
    file: File,
    setUrl: (url: string) => void,
    form: ReturnType<typeof Form.useForm>[0],
  ) => {
    try {
      const resp = await adminService.uploadOIDCIcon(file);
      const iconUrl = `${API_CONFIG.baseURL}/resource/image/${resp.id}`;
      setUrl(iconUrl);
      form.setFieldsValue({ icon: iconUrl });
      message.success(t('icon_upload_success'));
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleCreate = async (values: CreateOIDCProviderRequest) => {
    try {
      await adminService.createOIDCProvider(values);
      setCreateModalOpen(false);
      createForm.resetFields();
      setCreateIconUrl('');
      setCreateType('oidc');
      message.success(t('create_success'));
      fetchData(1);
      setPage(1);
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    }
  };

  const handleEdit = async (values: UpdateOIDCProviderRequest) => {
    if (!editingProvider) return;
    try {
      await adminService.updateOIDCProvider(editingProvider.id, values);
      message.success(t('update_success'));
      setEditModalOpen(false);
      editForm.resetFields();
      setEditingProvider(null);
      setEditIconUrl('');
      setEditType('oidc');
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
    const providerType = provider.type || 'oidc';
    setEditingProvider(provider);
    setEditIconUrl(provider.icon || '');
    setEditType(providerType);
    editForm.setFieldsValue({
      type: providerType,
      name: provider.name,
      issuer_url: provider.issuer_url,
      auth_url: provider.auth_url,
      token_url: provider.token_url,
      userinfo_url: provider.userinfo_url,
      client_id: provider.client_id,
      client_secret: '****',
      scopes: provider.scopes,
      icon: provider.icon,
      display_order: provider.display_order,
      status: provider.status,
    });
    setEditModalOpen(true);
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'oauth2':
        return t('type_oauth2');
      case 'qq':
        return t('type_qq');
      default:
        return t('type_oidc');
    }
  };

  const columns: ColumnsType<OIDCProviderItem> = [
    {
      title: t('col_icon'),
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (val: string, record: OIDCProviderItem) =>
        val ? (
          <Avatar src={val} size="small" shape="square" />
        ) : (
          <Avatar size="small" shape="square">
            {record.name?.[0]?.toUpperCase()}
          </Avatar>
        ),
    },
    {
      title: t('col_type'),
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (val: string) => <Tag>{typeLabel(val)}</Tag>,
    },
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
      render: (_: string, record: OIDCProviderItem) => {
        const type = record.type || 'oidc';
        if (type === 'oidc') return record.issuer_url;
        return record.auth_url || '-';
      },
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

  const iconField = (
    iconUrl: string,
    setUrl: (url: string) => void,
    form: ReturnType<typeof Form.useForm>[0],
  ) => (
    <Form.Item name="icon" label={t('field_icon')}>
      <Space direction="vertical" className="w-full">
        <Space>
          {iconUrl && <Avatar src={iconUrl} size={40} shape="square" />}
          <Upload
            accept="image/*"
            showUploadList={false}
            maxCount={1}
            beforeUpload={(file) => {
              handleIconUpload(file as File, setUrl, form);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>{t('icon_upload')}</Button>
          </Upload>
        </Space>
        <Input
          placeholder="https://example.com/icon.svg"
          value={iconUrl}
          onChange={(e) => {
            setUrl(e.target.value);
            form.setFieldsValue({ icon: e.target.value });
          }}
        />
      </Space>
    </Form.Item>
  );

  const formFields = (
    isEdit: boolean,
    form: ReturnType<typeof Form.useForm>[0],
    iconUrl: string,
    setUrl: (url: string) => void,
    currentType: string,
    setCurrentType: (t: string) => void,
  ) => {
    const isOIDC = currentType === 'oidc' || currentType === '';
    return (
      <>
        <Form.Item
          name="type"
          label={t('field_type')}
          rules={[{ required: true }]}
        >
          <Select
            onChange={(val: string) => {
              setCurrentType(val);
              form.setFieldsValue({ type: val });
              // Clear irrelevant URL fields to avoid stale data submission
              if (val === 'oidc' || val === '') {
                form.setFieldsValue({
                  auth_url: undefined,
                  token_url: undefined,
                  userinfo_url: undefined,
                });
              } else {
                form.setFieldsValue({ issuer_url: undefined });
              }
            }}
          >
            <Select.Option value="oidc">{t('type_oidc')}</Select.Option>
            <Select.Option value="oauth2">{t('type_oauth2')}</Select.Option>
            <Select.Option value="qq">{t('type_qq')}</Select.Option>
          </Select>
        </Form.Item>
        {isOIDC ? (
          <Form.Item
            name="issuer_url"
            label={t('field_issuer_url')}
            rules={[
              { required: true, message: t('field_issuer_url_required') },
              { type: 'url', message: t('field_issuer_url_invalid') },
            ]}
          >
            <Input
              placeholder="https://accounts.google.com"
              addonAfter={
                <Button
                  type="text"
                  size="small"
                  icon={<SearchOutlined />}
                  loading={discovering}
                  onClick={() => handleDiscover(form)}
                  className="!h-auto !p-0"
                >
                  {t('discover_button')}
                </Button>
              }
            />
          </Form.Item>
        ) : (
          <>
            <Form.Item
              name="auth_url"
              label={t('field_auth_url')}
              rules={[
                { required: true, message: t('field_auth_url_required') },
                { type: 'url', message: t('field_url_invalid') },
              ]}
            >
              <Input placeholder="https://github.com/login/oauth/authorize" />
            </Form.Item>
            <Form.Item
              name="token_url"
              label={t('field_token_url')}
              rules={[
                { required: true, message: t('field_token_url_required') },
                { type: 'url', message: t('field_url_invalid') },
              ]}
            >
              <Input placeholder="https://github.com/login/oauth/access_token" />
            </Form.Item>
            <Form.Item
              name="userinfo_url"
              label={t('field_userinfo_url')}
              rules={[
                { required: true, message: t('field_userinfo_url_required') },
                { type: 'url', message: t('field_url_invalid') },
              ]}
            >
              <Input placeholder="https://api.github.com/user" />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="name"
          label={t('field_name')}
          rules={[{ required: true, message: t('field_name_required') }]}
        >
          <Input />
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
          <Input
            placeholder={
              isOIDC ? 'openid,profile,email' : 'read:user,user:email'
            }
          />
        </Form.Item>
        {iconField(iconUrl, setUrl, form)}
        <Form.Item name="display_order" label={t('field_display_order')}>
          <InputNumber min={0} />
        </Form.Item>
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCreateIconUrl('');
            setCreateType('oidc');
            setCreateModalOpen(true);
          }}
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
          setCreateIconUrl('');
          setCreateType('oidc');
        }}
        footer={null}
      >
        <Spin spinning={discovering}>
          <Form
            form={createForm}
            onFinish={handleCreate}
            layout="vertical"
            initialValues={{ display_order: 0, type: 'oidc' }}
          >
            {formFields(
              false,
              createForm,
              createIconUrl,
              setCreateIconUrl,
              createType,
              setCreateType,
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {t('create_button')}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={t('edit_title')}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          editForm.resetFields();
          setEditingProvider(null);
          setEditIconUrl('');
          setEditType('oidc');
        }}
        footer={null}
      >
        <Spin spinning={discovering}>
          <Form form={editForm} onFinish={handleEdit} layout="vertical">
            {formFields(
              true,
              editForm,
              editIconUrl,
              setEditIconUrl,
              editType,
              setEditType,
            )}
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
        </Spin>
      </Modal>
    </div>
  );
}
