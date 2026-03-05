'use client';

import {
  ExclamationCircleOutlined,
  ApiOutlined,
  CopyOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  message,
  Modal,
  Typography,
  Alert,
  Input,
  Tooltip,
  Tag,
} from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/contexts/UserContext';
import {
  useWebhook,
  useRefreshWebhookToken,
} from '@/lib/api/hooks/userSettings';

const { Text, Paragraph } = Typography;

interface WebhookSettingsProps {
  initialToken?: string;
}

const STEP_COLORS = [
  { bg: 'bg-blue-500', text: 'text-blue-500' },
  { bg: 'bg-violet-500', text: 'text-violet-500' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500' },
];

export default function WebhookSettings({
  initialToken,
}: WebhookSettingsProps) {
  const [modal, contextHolder] = Modal.useModal();
  const [copied, setCopied] = useState<string>('');
  const user = useUser();
  const t = useTranslations('user.webhook');

  const {
    data: webhookData,
    error: webhookError,
    mutate: mutateWebhook,
  } = useWebhook();
  const { refreshToken, loading } = useRefreshWebhookToken();

  const token = initialToken || webhookData?.token || '';
  const isLoading = !initialToken && !webhookData && !webhookError;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      message.success(t('copy_success'));
      setTimeout(() => setCopied(''), 2000);
    } catch (_err) {
      message.error(t('copy_failed'));
    }
  };

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://scriptcat.org'}/api/v2/webhook/${user.user?.user_id || 'USER_ID'}`;

  if (isLoading) {
    return <Card loading className="min-h-[400px]" />;
  }

  const steps = [
    {
      title: t('step_bind_repo'),
      desc: t('step_bind_repo_desc'),
      tag: 'Step 1',
      colorIdx: 0,
    },
    {
      title: t('step_config_webhook'),
      desc: t('step_config_webhook_desc'),
      detail: t('step_config_webhook_detail'),
      tag: 'Step 2',
      colorIdx: 1,
    },
    {
      title: t('step_select_events'),
      desc: t('step_select_events_desc'),
      tag: 'Step 3',
      colorIdx: 2,
      events: [
        { name: t('event_push'), desc: t('event_push_desc') },
        { name: t('event_release'), desc: t('event_release_desc') },
        { name: t('event_tag'), desc: t('event_tag_desc') },
      ],
    },
  ];

  const configFields = [
    {
      label: 'Webhook URL',
      value: webhookUrl,
      copyKey: 'url',
      tooltipKey: 'copy_url_tooltip',
    },
    {
      label: 'Content-Type',
      value: 'application/json',
      copyKey: 'content-type',
      tooltipKey: 'copy_content_type_tooltip',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {contextHolder}

      {/* Section: Description */}
      <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5 dark:border-neutral-700 dark:bg-neutral-800/50">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-blue-500/10 text-xl text-blue-500">
          <ApiOutlined />
        </div>
        <div>
          <h3 className="m-0 mb-1 text-base font-semibold">
            {t('settings_title')}
          </h3>
          <Paragraph className="!mb-0" type="secondary">
            {t('settings_description')}
          </Paragraph>
        </div>
      </div>

      {/* Section: Steps */}
      <Card bordered>
        <div className="mb-4 flex items-center gap-2 text-[15px] font-semibold">
          <CheckCircleOutlined className="text-emerald-500" />
          <span>{t('config_steps')}</span>
        </div>

        <Alert
          message={t('config_tip_title')}
          description={t('config_tip_description')}
          type="info"
          showIcon
          className="!mb-6"
        />

        <div className="flex flex-col">
          {steps.map((step, i) => {
            const colors = STEP_COLORS[step.colorIdx];
            return (
              <div key={i} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${colors.bg}`}
                  >
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="my-1.5 w-0.5 flex-1 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
                  )}
                </div>
                <div
                  className={`min-w-0 flex-1 ${i < steps.length - 1 ? 'pb-6' : ''}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Text strong className="!text-base">
                      {step.title}
                    </Text>
                    <Tag
                      bordered={false}
                      className={`!text-xs !font-medium ${colors.text}`}
                    >
                      {step.tag}
                    </Tag>
                  </div>
                  <Text type="secondary">{step.desc}</Text>
                  {step.detail && (
                    <Text type="secondary" className="!mt-1 !block !text-xs">
                      {step.detail}
                    </Text>
                  )}
                  {step.events && (
                    <div className="mt-2.5 flex flex-col gap-1.5 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
                      {step.events.map((evt, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Tag bordered={false} className="!font-medium">
                            {evt.name}
                          </Tag>
                          <Text type="secondary" className="!text-xs">
                            {evt.desc}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section: Config Info */}
      <Card bordered>
        <div className="mb-4 flex items-center gap-2 text-[15px] font-semibold">
          <InfoCircleOutlined className="text-blue-500" />
          <span>{t('config_info_title')}</span>
        </div>

        <div className="flex flex-col gap-5">
          {configFields.map((field) => (
            <div key={field.copyKey}>
              <div className="mb-1.5 flex items-center justify-between">
                <Text strong>{field.label}</Text>
                <Tooltip title={t(field.tooltipKey)}>
                  <Button
                    type="text"
                    size="small"
                    className="!h-7 !w-7"
                    icon={
                      copied === field.copyKey ? (
                        <CheckCircleOutlined className="text-emerald-500" />
                      ) : (
                        <CopyOutlined />
                      )
                    }
                    onClick={() => copyToClipboard(field.value, field.copyKey)}
                  />
                </Tooltip>
              </div>
              <Input value={field.value} readOnly />
            </div>
          ))}

          {/* Secret field */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Text strong>{'Secret'}</Text>
              <div className="flex items-center gap-1">
                <Tooltip title={t('copy_secret_tooltip')}>
                  <Button
                    type="text"
                    size="small"
                    className="!h-7 !w-7"
                    icon={
                      copied === 'secret' ? (
                        <CheckCircleOutlined className="text-emerald-500" />
                      ) : (
                        <CopyOutlined />
                      )
                    }
                    onClick={() => copyToClipboard(token, 'secret')}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={() => {
                    modal.confirm({
                      title: t('confirm_refresh_title'),
                      content: t('confirm_refresh_content'),
                      icon: <ExclamationCircleOutlined />,
                      okText: t('confirm_refresh'),
                      cancelText: t('cancel'),
                      onOk: async () => {
                        try {
                          const data = await refreshToken();
                          mutateWebhook(data, false);
                          message.success(t('refresh_success'));
                        } catch (error) {
                          console.error(
                            'Failed to refresh webhook token:',
                            error,
                          );
                          message.error(t('refresh_failed'));
                        }
                      },
                    });
                  }}
                >
                  {t('refresh_secret')}
                </Button>
              </div>
            </div>
            <Input.Password value={token} readOnly visibilityToggle />
          </div>
        </div>

        <Alert
          message={t('security_tip_title')}
          description={t('security_tip_content')}
          type="warning"
          showIcon
          className="!mt-6"
        />
      </Card>
    </div>
  );
}
