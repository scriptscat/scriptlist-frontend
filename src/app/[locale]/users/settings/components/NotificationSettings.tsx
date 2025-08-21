'use client';

import {
  ExclamationCircleOutlined,
  ApiOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Card, message, Typography, Alert, Badge, List, Switch } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useUserConfig,
  useUpdateUserNotify,
} from '@/lib/api/hooks/userSettings';

const { Title, Text, Paragraph } = Typography;

interface NotificationSettingsProps {
  initialConfig?: {
    [key: string]: boolean;
  };
}

export default function NotificationSettings({
  initialConfig,
}: NotificationSettingsProps) {
  const [savingKey, setSavingKey] = useState<string>('');
  const t = useTranslations('user.notification_settings');

  // 使用hooks获取用户配置
  const {
    data: userConfig,
    error: configError,
    mutate: mutateConfig,
  } = useUserConfig();
  const { updateNotify } = useUpdateUserNotify();

  // 优先使用服务端传入的配置，其次使用hook获取的数据
  const notifyChecked = initialConfig || userConfig?.notify || {};
  const isLoading = !initialConfig && !userConfig && !configError;

  const notifyCategories = [
    {
      title: t('interaction_notifications'),
      icon: <BellOutlined className="text-blue-500" />,
      items: [
        {
          key: 'at',
          title: t('mention_notification_title'),
          description: t('mention_notification_description'),
          type: 'primary',
        },
        {
          key: 'score',
          title: t('score_notification_title'),
          description: t('score_notification_description'),
          type: 'primary',
        },
      ],
    },
    {
      title: t('script_management'),
      icon: <ApiOutlined className="text-green-500" />,
      items: [
        {
          key: 'create_script',
          title: t('create_script_notification_title'),
          description: t('create_script_notification_description'),
          type: 'secondary',
        },
        {
          key: 'script_update',
          title: t('script_update_notification_title'),
          description: t('script_update_notification_description'),
          type: 'primary',
        },
      ],
    },
    {
      title: t('feedback_interaction'),
      icon: <ExclamationCircleOutlined className="text-orange-500" />,
      items: [
        {
          key: 'script_issue',
          title: t('script_issue_notification_title'),
          description: t('script_issue_notification_description'),
          type: 'primary',
        },
        {
          key: 'script_issue_comment',
          title: t('script_issue_comment_notification_title'),
          description: t('script_issue_comment_notification_description'),
          type: 'primary',
        },
      ],
    },
  ];

  const handleNotifyChange = async (key: string, checked: boolean) => {
    setSavingKey(key);
    const newNotifyChecked = {
      ...notifyChecked,
      [key]: checked,
    };

    try {
      await updateNotify(newNotifyChecked);
      // 更新SWR缓存
      mutateConfig({ notify: newNotifyChecked }, false);
      message.success(t('settings_saved'));
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      message.error(t('save_failed'));
    } finally {
      setSavingKey('');
    }
  };

  if (isLoading) {
    return <Card loading className="min-h-[400px]" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 概览卡片 */}
      <Card className="bg-gradient-to-r">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <BellOutlined className="text-2xl" />
            </div>
          </div>
          <div className="flex-1">
            <Title level={4} className="!mb-2">
              {t('notification_settings_title')}
            </Title>
            <Paragraph className="!mb-4">
              {t('notification_settings_description')}
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* 通知设置列表 */}
      {notifyCategories.map((category, categoryIndex) => (
        <Card
          key={categoryIndex}
          title={
            <div className="flex items-center space-x-3">
              {category.icon}
              <span>{category.title}</span>
            </div>
          }
          className="shadow-sm"
        >
          <List
            dataSource={category.items}
            renderItem={(item) => (
              <List.Item className="!border-b-0 !py-4">
                <List.Item.Meta
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Text strong className="text-base">
                          {item.title}
                        </Text>
                        {item.type === 'secondary' && (
                          <Badge
                            size="small"
                            status="default"
                            text={t('admin_badge')}
                          />
                        )}
                      </div>
                      <Switch
                        checked={notifyChecked[item.key]}
                        loading={savingKey === item.key}
                        onChange={(checked) =>
                          handleNotifyChange(item.key, checked)
                        }
                        size="default"
                      />
                    </div>
                  }
                  description={
                    <Text type="secondary" className="text-sm">
                      {item.description}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}

      {/* 说明信息 */}
      <Card>
        <Alert
          message={t('email_notification_info_title')}
          description={
            <div className="space-y-2">
              <div>
                {'• '}
                {t('email_notification_info_item_1')}
              </div>
              <div>
                {'• '}
                {t('email_notification_info_item_2')}
              </div>
              <div>
                {'• '}
                {t('email_notification_info_item_3')}
              </div>
              <div>
                {'• '}
                {t('email_notification_info_item_4')}
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
}
