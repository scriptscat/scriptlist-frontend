'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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

const { Text, Paragraph } = Typography;

interface OAuthBindSettingsProps {
  embedded?: boolean;
}

export default function OAuthBindSettings({
  embedded,
}: OAuthBindSettingsProps) {
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

  const boundProviderKeys = new Set(bindings.map((b) => b.provider));
  const availableProviders = providers.filter(
    (p) => !boundProviderKeys.has(`oidc:${p.id}`),
  );

  return (
    <div className="flex flex-col gap-5">
      {!embedded ? (
        <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-violet-500/10 text-xl text-violet-500">
            <LinkOutlined />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="m-0 mb-1 text-base font-semibold">{t('title')}</h3>
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
                  <Button type="primary" size="small" icon={<PlusOutlined />}>
                    {t('bind_new')}
                  </Button>
                </Dropdown>
              )}
            </div>
            <Paragraph className="!mb-0" type="secondary">
              {t('description')}
            </Paragraph>
          </div>
        </div>
      ) : (
        availableProviders.length > 0 && (
          <div className="flex justify-end">
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
              <Button type="primary" size="small" icon={<PlusOutlined />}>
                {t('bind_new')}
              </Button>
            </Dropdown>
          </div>
        )
      )}

      <Card bordered>
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
          <div className="mt-3">
            <Text type="secondary">{t('no_providers')}</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
