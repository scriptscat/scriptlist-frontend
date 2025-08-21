'use client';

import { ApiOutlined, BellOutlined } from '@ant-design/icons';
import { Card, Tabs, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import WebhookSettings from './WebhookSettings';
import NotificationSettings from './NotificationSettings';

const { Title, Text } = Typography;

interface SettingsClientProps {
  initialWebhookToken?: string;
  initialNotificationConfig?: {
    [key: string]: boolean;
  };
}

export default function SettingsClient({
  initialWebhookToken,
  initialNotificationConfig,
}: SettingsClientProps) {
  const t = useTranslations('user.settings');

  const items = [
    {
      key: 'webhook',
      label: (
        <div className="flex items-center space-x-2">
          <ApiOutlined />
          <span>{t('webhook_settings')}</span>
        </div>
      ),
      children: <WebhookSettings initialToken={initialWebhookToken} />,
    },
    {
      key: 'notification',
      label: (
        <div className="flex items-center space-x-2">
          <BellOutlined />
          <span>{t('notification_settings')}</span>
        </div>
      ),
      children: (
        <NotificationSettings initialConfig={initialNotificationConfig} />
      ),
    },
  ];

  return (
    <div>
      {/* 页面头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BellOutlined className="text-white text-lg" />
              </div>
              <Title level={2} className="!mb-0">
                {t('user_settings')}
              </Title>
            </div>
            <Text type="secondary" className="text-base">
              {t('settings_description')}
            </Text>
          </div>
        </div>
      </div>

      {/* 设置选项卡 */}
      <Card className="shadow-lg border-0">
        <Tabs defaultActiveKey="webhook" items={items} size="large" />
      </Card>
    </div>
  );
}
