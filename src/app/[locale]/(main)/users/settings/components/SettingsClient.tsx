'use client';

import { useState } from 'react';
import {
  ApiOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import WebhookSettings from './WebhookSettings';
import NotificationSettings from './NotificationSettings';
import AccountSettings from './AccountSettings';

const { Text } = Typography;

interface SettingsClientProps {
  initialWebhookToken?: string;
  initialNotificationConfig?: {
    [key: string]: number;
  };
  userStatus?: number;
  deactivateAt?: number;
}

const NAV_ITEMS = [
  {
    key: 'webhook',
    icon: ApiOutlined,
    activeIconCls: 'text-blue-500',
    activeIconBgCls: 'bg-blue-500/10',
    indicatorCls: 'bg-blue-500',
  },
  {
    key: 'notification',
    icon: BellOutlined,
    activeIconCls: 'text-amber-500',
    activeIconBgCls: 'bg-amber-500/10',
    indicatorCls: 'bg-amber-500',
  },
  {
    key: 'account',
    icon: UserOutlined,
    activeIconCls: 'text-purple-500',
    activeIconBgCls: 'bg-purple-500/10',
    indicatorCls: 'bg-purple-500',
  },
] as const;

type SettingsKey = (typeof NAV_ITEMS)[number]['key'];

export default function SettingsClient({
  initialWebhookToken,
  initialNotificationConfig,
  userStatus,
  deactivateAt,
}: SettingsClientProps) {
  const t = useTranslations('user.settings');
  const [activeKey, setActiveKey] = useState<SettingsKey>('webhook');

  const labelMap: Record<SettingsKey, string> = {
    webhook: t('webhook_settings'),
    notification: t('notification_settings'),
    account: t('account_settings'),
  };

  const renderContent = () => {
    switch (activeKey) {
      case 'webhook':
        return <WebhookSettings initialToken={initialWebhookToken} />;
      case 'notification':
        return (
          <NotificationSettings initialConfig={initialNotificationConfig} />
        );
      case 'account':
        return (
          <AccountSettings
            userStatus={userStatus}
            deactivateAt={deactivateAt}
          />
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-blue-500/10 text-[22px] text-blue-500">
          <SettingOutlined />
        </div>
        <div>
          <h1 className="m-0 mb-0.5 text-2xl font-bold leading-tight tracking-tight">
            {t('user_settings')}
          </h1>
          <Text type="secondary">{t('settings_description')}</Text>
        </div>
      </div>

      {/* Outer Card wrapping sidebar + content */}
      <Card bordered>
        <div className="flex min-h-[560px] items-stretch max-md:min-h-0 max-md:flex-col">
          {/* Sidebar Navigation */}
          <nav className="flex w-[200px] shrink-0 flex-col gap-1 pr-1 max-md:w-full max-md:flex-row max-md:overflow-x-auto max-md:pr-0 max-md:pb-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className={`relative flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-none px-3 py-2.5 text-left transition-all duration-200 max-md:shrink-0 max-md:rounded-lg max-md:px-3.5 max-md:py-2 ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                      : 'bg-transparent text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-50'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[15px] transition-all duration-200 ${
                      isActive
                        ? `${item.activeIconCls} ${item.activeIconBgCls}`
                        : 'bg-neutral-50 dark:bg-neutral-800'
                    }`}
                  >
                    <Icon />
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium max-md:text-[13px]">
                    {labelMap[item.key]}
                  </span>
                  {isActive && (
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm ${item.indicatorCls} max-md:hidden`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-6 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700 max-md:mx-0 max-md:my-4 max-md:h-px max-md:w-full" />

          {/* Content Area */}
          <main className="min-w-0 flex-1 overflow-hidden">
            {renderContent()}
          </main>
        </div>
      </Card>
    </div>
  );
}
