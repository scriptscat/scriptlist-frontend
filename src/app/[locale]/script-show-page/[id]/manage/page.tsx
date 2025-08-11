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
  const t = useTranslations();
  const params = useParams();
  const scriptId = params.id as string;
  const { scriptSetting } = useScriptSetting();
  const [loading, setLoading] = useState(false);
  const [syncUrl, setSyncUrl] = useState(scriptSetting.sync_url);
  const [syncMode, setSyncMode] = useState<1 | 2>(scriptSetting.sync_mode); // 1: 自动同步, 2: 手动同步
  const [contentUrl, setContentUrl] = useState(scriptSetting.content_url);

  const handleSync = async () => {
    if (!syncUrl.trim()) {
      message.error('请输入同步地址');
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
      message.success('同步配置保存并同步成功');
    } catch (error) {
      console.error('Sync failed:', error);
      message.error('同步失败，请检查网络连接或地址是否正确');
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
            源代码同步
          </Title>
          <Text type="secondary">
            配置脚本的源代码同步，支持从 GitHub、GitLab
            等代码托管平台自动或手动同步脚本内容。
          </Text>
        </div>
      </div>
      <div className="space-y-4">
        <Form layout="vertical">
          <Form.Item label="同步地址" required>
            <Input
              placeholder="https://raw.githubusercontent.com/username/repo/main/script.js"
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="同步方式">
            <Radio.Group
              value={syncMode}
              onChange={(e) => setSyncMode(e.target.value)}
            >
              <Space direction="vertical">
                <Radio value={1}>
                  自动同步 - 定期检查更新并自动同步，你也可以设置Webhook触发更新
                </Radio>
                <Radio value={2}>手动同步 - 仅在手动点击时同步</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item label="脚本说明同步地址">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              可选：同步脚本的 README 或说明文档，支持 Markdown 格式
            </div>
            <Input
              placeholder="https://raw.githubusercontent.com/username/repo/main/README.md"
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
                保存并同步一次
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
}
