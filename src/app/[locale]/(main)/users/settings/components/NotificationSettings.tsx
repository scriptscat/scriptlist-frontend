'use client';

import {
  ExclamationCircleOutlined,
  ApiOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Card, message, Typography, Alert, Badge, Switch } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useUserConfig,
  useUpdateUserNotify,
} from '@/lib/api/hooks/userSettings';
import { useUser } from '@/contexts/UserContext';

const { Text, Paragraph } = Typography;

interface NotificationSettingsProps {
  initialConfig?: {
    [key: string]: number;
  };
}

// 每个分类对应的 Tailwind class
const CATEGORY_STYLES: Record<string, { iconCls: string; bgCls: string }> = {
  blue: { iconCls: 'text-blue-500', bgCls: 'bg-blue-500/10' },
  green: { iconCls: 'text-emerald-500', bgCls: 'bg-emerald-500/10' },
  amber: { iconCls: 'text-amber-500', bgCls: 'bg-amber-500/10' },
  red: { iconCls: 'text-red-500', bgCls: 'bg-red-500/10' },
};

export default function NotificationSettings({
  initialConfig,
}: NotificationSettingsProps) {
  const [savingKey, setSavingKey] = useState<string>('');
  const t = useTranslations('user.notification_settings');
  const { user } = useUser();
  const isAdmin = user && user.is_admin === 1;

  const {
    data: userConfig,
    error: configError,
    mutate: mutateConfig,
  } = useUserConfig();
  const { updateNotify } = useUpdateUserNotify();

  const notifyChecked = userConfig?.notify || initialConfig || {};
  const isLoading = !initialConfig && !userConfig && !configError;

  const notifyCategories = [
    {
      title: t('interaction_notifications'),
      icon: <BellOutlined />,
      colorKey: 'blue',
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
      icon: <ApiOutlined />,
      colorKey: 'green',
      items: [
        {
          key: 'create_script',
          title: t('create_script_notification_title'),
          description: t('create_script_notification_description'),
          type: 'primary',
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
      icon: <ExclamationCircleOutlined />,
      colorKey: 'amber',
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
    ...(isAdmin
      ? [
          {
            title: t('report_management'),
            icon: <ExclamationCircleOutlined />,
            colorKey: 'red',
            items: [
              {
                key: 'script_report',
                title: t('script_report_notification_title'),
                description: t('script_report_notification_description'),
                type: 'secondary',
              },
              {
                key: 'script_report_comment',
                title: t('script_report_comment_notification_title'),
                description: t(
                  'script_report_comment_notification_description',
                ),
                type: 'secondary',
              },
            ],
          },
        ]
      : []),
  ];

  const handleNotifyChange = async (key: string, checked: boolean) => {
    setSavingKey(key);
    const newNotifyChecked = {
      ...notifyChecked,
      [key]: checked ? 1 : 2,
    };

    try {
      mutateConfig(
        (current) => ({
          ...current,
          notify: newNotifyChecked,
        }),
        false,
      );

      await updateNotify(newNotifyChecked);
      message.success(t('settings_saved'));
      mutateConfig();
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      message.error(t('save_failed'));
      mutateConfig();
    } finally {
      setSavingKey('');
    }
  };

  if (isLoading) {
    return <Card loading className="min-h-[400px]" />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Section Intro */}
      <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5 dark:border-neutral-700 dark:bg-neutral-800/50">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-amber-500/10 text-xl text-amber-500">
          <BellOutlined />
        </div>
        <div>
          <h3 className="m-0 mb-1 text-base font-semibold">
            {t('notification_settings_title')}
          </h3>
          <Paragraph className="!mb-0" type="secondary">
            {t('notification_settings_description')}
          </Paragraph>
        </div>
      </div>

      {/* Notification Categories */}
      {notifyCategories.map((category, categoryIndex) => {
        const styles =
          CATEGORY_STYLES[category.colorKey] || CATEGORY_STYLES.blue;
        return (
          <Card key={categoryIndex} bordered>
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-sm ${styles.iconCls} ${styles.bgCls}`}
              >
                {category.icon}
              </span>
              <span className="text-sm font-semibold">{category.title}</span>
            </div>

            <div className="flex flex-col">
              {category.items.map((item, itemIndex) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 ${
                    itemIndex < category.items.length - 1
                      ? 'border-b border-neutral-200 dark:border-neutral-700'
                      : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <Text strong>{item.title}</Text>
                      {item.type === 'secondary' && (
                        <Badge
                          size="small"
                          status="default"
                          text={t('admin_badge')}
                        />
                      )}
                    </div>
                    <Text
                      type="secondary"
                      className="!text-xs !leading-relaxed"
                    >
                      {item.description}
                    </Text>
                  </div>
                  <Switch
                    checked={notifyChecked[item.key] !== 2}
                    loading={savingKey === item.key}
                    onChange={(checked) =>
                      handleNotifyChange(item.key, checked)
                    }
                    size="default"
                  />
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Info Alert */}
      <Alert
        message={t('email_notification_info_title')}
        description={
          <div className="space-y-1.5 text-xs">
            <div>
              {'・'}
              {t('email_notification_info_item_1')}
            </div>
            <div>
              {'・'}
              {t('email_notification_info_item_2')}
            </div>
            <div>
              {'・'}
              {t('email_notification_info_item_3')}
            </div>
            <div>
              {'・'}
              {t('email_notification_info_item_4')}
            </div>
          </div>
        }
        type="info"
        showIcon
      />
    </div>
  );
}
