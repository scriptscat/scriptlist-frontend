'use client';

import {
  ExclamationCircleOutlined,
  ApiOutlined,
  BellOutlined,
  CopyOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  message,
  Modal,
  Steps,
  Typography,
  Alert,
  Input,
  Tooltip,
} from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/contexts/UserContext';
import {
  useWebhook,
  useRefreshWebhookToken,
} from '@/lib/api/hooks/userSettings';

const { Title, Text, Paragraph } = Typography;

interface WebhookSettingsProps {
  initialToken?: string;
}

export default function WebhookSettings({
  initialToken,
}: WebhookSettingsProps) {
  const [modal, contextHolder] = Modal.useModal();
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState<string>('');
  const user = useUser();
  const t = useTranslations('user.webhook');

  // 使用hooks获取webhook数据
  const {
    data: webhookData,
    error: webhookError,
    mutate: mutateWebhook,
  } = useWebhook();
  const { refreshToken, loading } = useRefreshWebhookToken();

  // 优先使用服务端传入的token，其次使用hook获取的数据
  const token = initialToken || webhookData?.token || '';
  const isLoading = !initialToken && !webhookData && !webhookError;

  const onChange = (value: number) => {
    setCurrent(value);
  };

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

  return (
    <div className="flex flex-col gap-3">
      {contextHolder}

      {/* 概览卡片 */}
      <Card className="bg-gradient-to-r">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <ApiOutlined className="text-2xl" />
            </div>
          </div>
          <div className="flex-1">
            <Title level={4} className="!mb-2">
              {t('settings_title')}
            </Title>
            <Paragraph className="!mb-4">{t('settings_description')}</Paragraph>
          </div>
        </div>
      </Card>

      {/* 配置步骤 */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <CheckCircleOutlined className="text-green-500" />
            <span>{t('config_steps')}</span>
          </div>
        }
      >
        <Alert
          message={t('config_tip_title')}
          description={t('config_tip_description')}
          type="info"
          showIcon
          className="!mb-6"
        />
        <Steps
          current={current}
          onChange={onChange}
          direction="vertical"
          className="custom-steps"
        >
          <Steps.Step
            title={t('step_bind_repo')}
            description={
              <div className="mt-2">
                <Text>{t('step_bind_repo_desc')}</Text>
              </div>
            }
            icon={<LinkOutlined />}
          />
          <Steps.Step
            title={t('step_config_webhook')}
            description={
              <div className="mt-2">
                <Text>{t('step_config_webhook_desc')}</Text>
                <div className="mt-2">
                  <Text type="secondary">
                    {t('step_config_webhook_detail')}
                  </Text>
                </div>
              </div>
            }
            icon={<ApiOutlined />}
          />
          <Steps.Step
            title={t('step_select_events')}
            description={
              <div className="mt-2 space-y-2">
                <Text>{t('step_select_events_desc')}</Text>
                <div className="ml-4 space-y-1">
                  <div>
                    {'• '}
                    <Text strong>{t('event_push')}</Text>
                    {'：'}
                    {t('event_push_desc')}
                  </div>
                  <div>
                    {'• '}
                    <Text strong>{t('event_release')}</Text>
                    {'：'}
                    {t('event_release_desc')}
                  </div>
                  <div>
                    {'• '}
                    <Text strong>{t('event_tag')}</Text>
                    {'：'}
                    {t('event_tag_desc')}
                  </div>
                </div>
              </div>
            }
            icon={<BellOutlined />}
          />
        </Steps>
      </Card>

      {/* Webhook 配置信息 */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <InfoCircleOutlined className="text-blue-500" />
            <span>{t('config_info_title')}</span>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Text strong className="text-base">
                {'Webhook URL'}
              </Text>
              <Tooltip title={t('copy_url_tooltip')}>
                <Button
                  type="text"
                  size="small"
                  icon={
                    copied === 'url' ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <CopyOutlined />
                    )
                  }
                  onClick={() => copyToClipboard(webhookUrl, 'url')}
                />
              </Tooltip>
            </div>
            <Input value={webhookUrl} readOnly />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Text strong className="text-base">
                {'Content-Type'}
              </Text>
              <Tooltip title={t('copy_content_type_tooltip')}>
                <Button
                  type="text"
                  size="small"
                  icon={
                    copied === 'content-type' ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <CopyOutlined />
                    )
                  }
                  onClick={() =>
                    copyToClipboard('application/json', 'content-type')
                  }
                />
              </Tooltip>
            </div>
            <Input value="application/json" readOnly />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Text strong className="text-base">
                {'Secret'}
              </Text>
              <div className="flex items-center space-x-2">
                <Tooltip title={t('copy_secret_tooltip')}>
                  <Button
                    type="text"
                    size="small"
                    icon={
                      copied === 'secret' ? (
                        <CheckCircleOutlined className="text-green-500" />
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
                          // 更新SWR缓存
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
