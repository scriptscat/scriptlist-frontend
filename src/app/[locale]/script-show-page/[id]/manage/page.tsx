'use client';

import {
  Button,
  Space,
  Input,
  Form,
  Radio,
  message,
  Divider,
  Card,
  Typography,
} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useScriptSetting } from '@/contexts/ScriptSettingContext';
import scriptService from '@/lib/api/services/scripts';

const { Title, Text } = Typography;

export default function ManagePage() {
  const t = useTranslations('script.manage.sync');
  const params = useParams();
  const scriptId = params.id as string;
  const { scriptSetting } = useScriptSetting();
  const [loading, setLoading] = useState(false);
  const [syncUrl, setSyncUrl] = useState(scriptSetting.sync_url);
  const [syncMode, setSyncMode] = useState<1 | 2>(scriptSetting.sync_mode); // 1: 自动同步, 2: 手动同步
  const [contentUrl, setContentUrl] = useState(scriptSetting.content_url);

  const handleSync = async () => {
    if (!syncUrl.trim()) {
      message.error(t('sync_url_required'));
      return;
    }

    setLoading(true);
    try {
      await scriptService.updateSync(scriptId, {
        content_url: contentUrl,
        sync_mode: syncMode,
        sync_url: syncUrl,
        definition_url: undefined, // 如果需要可以添加字段
      });
      message.success(t('sync_success'));
    } catch (error) {
      console.error('Sync failed:', error);
      message.error(t('sync_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            {t('title')}
          </Title>
          <Text type="secondary">
            {t('description')}
          </Text>
        </div>
      </div>
      <div className="space-y-4">
        <Form layout="vertical">
          <Form.Item label={t('sync_url_label')} required>
            <Input
              placeholder={t('sync_url_placeholder')}
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
            />
          </Form.Item>

          <Form.Item label={t('sync_mode_label')}>
            <Radio.Group
              value={syncMode}
              onChange={(e) => setSyncMode(e.target.value)}
            >
              <Space direction="vertical">
                <Radio value={1}>
                  {t('sync_mode_auto')}
                </Radio>
                <Radio value={2}>{t('sync_mode_manual')}</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item label={t('content_url_label')}>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('content_url_description')}
            </div>
            <Input
              placeholder={t('content_url_placeholder')}
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                loading={loading}
                onClick={handleSync}
              >
                {t('save_and_sync_button')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
}
