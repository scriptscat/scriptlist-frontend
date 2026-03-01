'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dropdown,
  Empty,
  message,
  Popconfirm,
  Table,
  Typography,
} from 'antd';
import { LinkOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';
import { oidcService } from '@/lib/api/services/oidc';
import type {
  OIDCProviderInfo,
  UserOAuthBindItem,
} from '@/lib/api/services/oidc';
import { APIError } from '@/types/api';

const { Text } = Typography;

export default function OAuthBindSettings() {
  const t = useTranslations('user.oauth_bind');

  const [bindings, setBindings] = useState<UserOAuthBindItem[]>([]);
  const [providers, setProviders] = useState<OIDCProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBindings = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await oidcService.getBindList();
      setBindings(resp.items || []);
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBindings();
    oidcService
      .getProviders()
      .then((resp) => {
        setProviders(resp.providers || []);
      })
      .catch(() => {
        // ignore
      });
  }, [fetchBindings]);

  const handleUnbind = async (id: number) => {
    try {
      await oidcService.unbind(id);
      message.success(t('unbind_success'));
      fetchBindings();
    } catch (err) {
      if (err instanceof APIError) {
        message.error(err.msg);
      } else {
        message.error(t('unbind_failed'));
      }
    }
  };

  const handleBind = (providerId: number) => {
    const redirectUri = encodeURIComponent(window.location.pathname);
    window.location.href = `/api/v2/auth/oidc/${providerId}/bind?redirect_uri=${redirectUri}`;
  };

  const columns: ColumnsType<UserOAuthBindItem> = [
    {
      title: t('col_provider'),
      dataIndex: 'provider_name',
      key: 'provider_name',
    },
    {
      title: t('col_username'),
      dataIndex: 'provider_username',
      key: 'provider_username',
      render: (val: string) => val || '-',
    },
    {
      title: t('col_bindtime'),
      dataIndex: 'createtime',
      key: 'createtime',
      render: (val: number) =>
        val ? new Date(val * 1000).toLocaleString() : '-',
    },
    {
      title: t('col_actions'),
      key: 'actions',
      render: (_: unknown, record: UserOAuthBindItem) => (
        <Popconfirm
          title={t('unbind_confirm')}
          onConfirm={() => handleUnbind(record.id)}
        >
          <Button type="link" size="small" danger>
            {t('unbind')}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 过滤出未绑定的提供商
  const boundProviderKeys = new Set(bindings.map((b) => b.provider));
  const availableProviders = providers.filter(
    (p) => !boundProviderKeys.has(`oidc:${p.id}`),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <LinkOutlined className="text-blue-500" />
          <Text strong className="text-lg">
            {t('title')}
          </Text>
        </div>
        {availableProviders.length > 0 && (
          <Dropdown
            menu={{
              items: availableProviders.map((p) => ({
                key: p.id,
                label: p.name,
                onClick: () => handleBind(p.id),
              })),
            }}
            trigger={['click']}
          >
            <Button type="primary" icon={<PlusOutlined />}>
              {t('bind_new')}
            </Button>
          </Dropdown>
        )}
      </div>
      <Text type="secondary" className="block mb-4">
        {t('description')}
      </Text>
      <Table
        columns={columns}
        dataSource={bindings}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              description={t('no_bindings')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
      {providers.length === 0 && !loading && (
        <div className="mt-2">
          <Text type="secondary">{t('no_providers')}</Text>
        </div>
      )}
    </div>
  );
}
