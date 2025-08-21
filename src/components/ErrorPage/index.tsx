'use client';

import { useTranslations } from 'next-intl';
import { Button, Result, Card, Typography, Space, Divider, Tag } from 'antd';
import {
  HomeOutlined,
  ReloadOutlined,
  MessageOutlined,
  GithubOutlined,
  CustomerServiceOutlined,
  BugOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';

const { Paragraph, Text } = Typography;

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  showErrorDetails?: boolean;
  showFeedback?: boolean;
  error?: Error & { digest?: string };
}

export default function ErrorPage({
  statusCode = 500,
  title,
  subtitle,
  description,
  showErrorDetails = true,
  showFeedback = true,
  error,
}: ErrorPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [errorId, setErrorId] = useState<string>('');
  const [errorTime, setErrorTime] = useState<string>('');

  useEffect(() => {
    // 生成错误ID和时间
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    const time = new Date().toLocaleString('zh-CN');
    setErrorId(id);
    setErrorTime(time);

    // 记录错误信息
    if (error) {
      console.error('Error details:', {
        errorId: id,
        timestamp: time,
        statusCode,
        error: error.message,
        stack: error.stack,
        digest: error.digest,
      });
    }
  }, [error, statusCode]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const getResultStatus = () => {
    if (statusCode >= 500) return '500';
    if (statusCode === 404) return '404';
    if (statusCode === 403) return '403';
    return 'error';
  };

  const getErrorTitle = () => {
    if (title) return title;
    switch (statusCode) {
      case 404:
        return t('error.404_title');
      case 403:
        return t('error.403_title');
      case 500:
      default:
        return t('error.500_title');
    }
  };

  const getErrorSubtitle = () => {
    if (subtitle) return subtitle;
    switch (statusCode) {
      case 404:
        return t('error.404_subtitle');
      case 403:
        return t('error.403_subtitle');
      case 500:
      default:
        return t('error.500_subtitle');
    }
  };

  const getErrorDescription = () => {
    if (description) return description;
    switch (statusCode) {
      case 404:
        return t('error.404_description');
      case 403:
        return t('error.403_description');
      case 500:
      default:
        return t('error.500_description');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Result
          status={getResultStatus() as any}
          title={getErrorTitle()}
          subTitle={getErrorSubtitle()}
          extra={
            <Space size="middle">
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={handleGoHome}
              >
                {t('error.back_to_home')}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                {t('error.refresh_page')}
              </Button>
            </Space>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 错误详情卡片 */}
          {showErrorDetails && (
            <Card
              title={
                <Space>
                  <BugOutlined />
                  {t('error.what_happened')}
                </Space>
              }
              variant="borderless"
              className="h-full"
            >
              <Space direction="vertical" size="large" className="w-full">
                <Paragraph>{getErrorDescription()}</Paragraph>

                {statusCode >= 500 && (
                  <Paragraph>{t('error.server_error_details')}</Paragraph>
                )}

                <div>
                  <Text strong>{t('error.what_can_do')}</Text>
                  <ul className="mt-2 ml-4">
                    <li>{t('error.try_refresh')}</li>
                    <li>{t('error.try_later')}</li>
                    {statusCode >= 500 && <li>{t('error.check_network')}</li>}
                    <li>{t('error.contact_us')}</li>
                  </ul>
                </div>

                <Divider />

                <Space direction="vertical" size="small">
                  <Text type="secondary">
                    {t('error.error_time')}
                    {': '}
                    {errorTime}
                  </Text>
                  <Text type="secondary">
                    {t('error.error_code')}
                    {': '}
                    <Tag color="red" className="!ml-2">
                      {statusCode}
                    </Tag>
                  </Text>
                  <Text type="secondary">
                    {t('error.error_id') + ':'} {errorId}
                  </Text>
                  {error?.digest && (
                    <Text type="secondary">
                      {'Digest: '}
                      {error.digest}
                    </Text>
                  )}
                </Space>
              </Space>
            </Card>
          )}

          {/* 反馈卡片 */}
          {showFeedback && (
            <Card
              title={
                <Space>
                  <CustomerServiceOutlined />
                  {t('error.feedback_title')}
                </Space>
              }
              variant="borderless"
              className={showErrorDetails ? 'h-full' : ''}
            >
              <Space direction="vertical" size="large" className="w-full">
                <Paragraph>{t('error.feedback_description')}</Paragraph>

                <Space direction="vertical" size="middle" className="w-full">
                  <Button
                    type="default"
                    icon={<MessageOutlined />}
                    size="large"
                    block
                    onClick={() =>
                      window.open('https://bbs.tampermonkey.net.cn', '_blank')
                    }
                  >
                    {t('error.feedback_forum')}
                  </Button>

                  <Button
                    type="default"
                    icon={<GithubOutlined />}
                    size="large"
                    block
                    onClick={() =>
                      window.open(
                        'https://github.com/scriptscat/scriptlist-frontend/issues',
                        '_blank',
                      )
                    }
                  >
                    {t('error.feedback_github')}
                  </Button>
                </Space>

                <Divider />

                <div className="text-center">
                  <Text type="secondary" className="text-sm">
                    <WarningOutlined className="mr-1" />
                    {t('error.feedback_notice')}
                  </Text>
                </div>
              </Space>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
