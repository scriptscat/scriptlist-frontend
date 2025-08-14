'use client';

import {
  ExclamationCircleOutlined,
  ApiOutlined,
  BellOutlined,
} from '@ant-design/icons';
import {
  Card,
  message,
  Typography,
  Alert,
  Badge,
  List,
  Switch,
} from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUserConfig, useUpdateUserNotify } from '@/lib/api/hooks/userSettings';

const { Title, Text, Paragraph } = Typography;

interface NotificationSettingsProps {
  initialConfig?: {
    [key: string]: boolean;
  };
}

export default function NotificationSettings({ initialConfig }: NotificationSettingsProps) {
  const [savingKey, setSavingKey] = useState<string>('');
  const t = useTranslations();

  // 使用hooks获取用户配置
  const { data: userConfig, error: configError, mutate: mutateConfig } = useUserConfig();
  const { updateNotify } = useUpdateUserNotify();

  // 优先使用服务端传入的配置，其次使用hook获取的数据
  const notifyChecked = initialConfig || userConfig?.notify || {};
  const isLoading = !initialConfig && !userConfig && !configError;

  const notifyCategories = [
    {
      title: '互动通知',
      icon: <BellOutlined className="text-blue-500" />,
      items: [
        {
          key: 'at',
          title: '@我时发送通知',
          description: '当有用户在评论或反馈中@我时发送邮件通知',
          type: 'primary',
        },
        {
          key: 'score',
          title: '脚本被评分通知',
          description: '当我的脚本收到新的评分时发送通知',
          type: 'primary',
        },
      ],
    },
    {
      title: '脚本管理',
      icon: <ApiOutlined className="text-green-500" />,
      items: [
        {
          key: 'create_script',
          title: '脚本创建通知',
          description: '当有关注的用户创建脚本时发送通知',
          type: 'secondary',
        },
        {
          key: 'script_update',
          title: '关注脚本更新',
          description: '当我关注的脚本有新版本更新时发送通知',
          type: 'primary',
        },
      ],
    },
    {
      title: '反馈互动',
      icon: <ExclamationCircleOutlined className="text-orange-500" />,
      items: [
        {
          key: 'script_issue',
          title: '新反馈通知',
          description: '当我关注的脚本收到新的问题反馈时发送通知',
          type: 'primary',
        },
        {
          key: 'script_issue_comment',
          title: '反馈回复通知',
          description: '当我关注的反馈有新回复时发送通知',
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
      message.success('设置已保存');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      message.error('保存失败');
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
              通知设置
            </Title>
            <Paragraph className="!mb-4">
              自定义你的邮件通知偏好，及时了解脚本相关的重要动态和互动信息。
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
                          <Badge size="small" status="default" text="管理员" />
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
          message="邮件通知说明"
          description={
            <div className="space-y-2">
              <div>• 所有通知将发送到你的注册邮箱</div>
              <div>• 你可以随时修改这些通知设置</div>
              <div>• 重要的系统通知（如安全相关）无法关闭</div>
              <div>• 通知邮件可能会被归类到垃圾邮件，请注意查看</div>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
}
