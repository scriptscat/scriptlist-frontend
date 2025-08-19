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
  const t = useTranslations();

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
      message.success('复制成功');
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      message.error('复制失败');
    }
  };

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_API_URL || 'https://api.scriptcat.org'}/webhook/${user.user?.user_id || 'USER_ID'}`;

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
              Webhook 设置
            </Title>
            <Paragraph className="!mb-4">
              使用Webhook可以接受来自Github等地方等消息，在脚本页面的脚本管理中配置更新URL，可以实现自动的即时的脚本更新。
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* 配置步骤 */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <CheckCircleOutlined className="text-green-500" />
            <span>配置步骤</span>
          </div>
        }
      >
        <Alert
          message="配置提示"
          description="请按照以下步骤完成 Webhook 配置，确保脚本能够正确同步到你的代码仓库。"
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
            title="绑定代码仓库"
            description={
              <div className="mt-2">
                <Text>访问 Github 仓库进入 Settings</Text>
              </div>
            }
            icon={<LinkOutlined />}
          />
          <Steps.Step
            title="配置 Webhook"
            description={
              <div className="mt-2">
                <Text>点击 &quot;Add webhook&quot;</Text>
                <div className="mt-2">
                  <Text type="secondary">
                    在你的代码仓库中配置下面的 Webhook 地址和密钥
                  </Text>
                </div>
              </div>
            }
            icon={<ApiOutlined />}
          />
          <Steps.Step
            title="选择触发事件"
            description={
              <div className="mt-2 space-y-2">
                <Text>选择要监听的事件类型：</Text>
                <div className="ml-4 space-y-1">
                  <div>
                    • <Text strong>Push 事件</Text>：代码推送时触发同步
                  </div>
                  <div>
                    • <Text strong>Release 事件</Text>：发布新版本时触发同步
                  </div>
                  <div>
                    • <Text strong>Tag 事件</Text>：创建标签时触发同步
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
            <span>Webhook 配置信息</span>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Text strong className="text-base">
                Webhook URL
              </Text>
              <Tooltip title="复制 URL">
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
                Content-Type
              </Text>
              <Tooltip title="复制 Content-Type">
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
                Secret
              </Text>
              <div className="flex items-center space-x-2">
                <Tooltip title="复制 Secret">
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
                      title: '确认刷新密钥？',
                      content:
                        '刷新后旧的密钥将失效，请及时更新你的 Webhook 配置',
                      icon: <ExclamationCircleOutlined />,
                      okText: '确认刷新',
                      cancelText: '取消',
                      onOk: async () => {
                        try {
                          const data = await refreshToken();
                          // 更新SWR缓存
                          mutateWebhook(data, false);
                          message.success('密钥刷新成功');
                        } catch (error) {
                          console.error(
                            'Failed to refresh webhook token:',
                            error,
                          );
                          message.error('刷新失败');
                        }
                      },
                    });
                  }}
                >
                  刷新密钥
                </Button>
              </div>
            </div>
            <Input.Password value={token} readOnly visibilityToggle />
          </div>
        </div>

        <Alert
          message="安全提示"
          description="请妥善保管你的 Secret 密钥，不要将其泄露给他人。如果怀疑密钥已泄露，请立即刷新。"
          type="warning"
          showIcon
          className="!mt-6"
        />
      </Card>
    </div>
  );
}
