'use client';

import React from 'react';
import {
  Badge,
  Button,
  Card,
  message,
  Typography,
  Space,
  Divider,
  Alert,
  Avatar,
  Tag,
  Result,
  Spin,
} from 'antd';
import {
  UserOutlined,
  CodeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { scriptAccessService } from '@/lib/api/services/scripts';
import { InviteMessage } from '@/app/[locale]/script-show-page/[id]/types';
import { APIError } from '@/types/api';
import { Link } from '@/i18n/routing';

const { Title, Text } = Typography;

export default function InviteConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const t = useTranslations('invite');

  // 获取邀请信息
  const {
    data: inviteData,
    error,
    mutate: mutateInvite,
  } = useSWR<InviteMessage, APIError>(
    code ? ['invite-message', code] : null,
    () => scriptAccessService.getInviteMessage(code!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // 如果没有邀请码，重定向到首页
  if (!code) {
    router.push('/');
    return null;
  }

  // 错误处理
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <Result
            status="error"
            title="获取邀请信息失败"
            subTitle={error.message || '请检查邀请链接是否正确'}
            extra={[
              <Button
                type="primary"
                key="home"
                onClick={() => router.push('/')}
              >
                返回首页
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  // 加载中
  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">加载邀请信息中...</div>
          </div>
        </Card>
      </div>
    );
  }

  const { invite_status, script, group, access } = inviteData;
  const isGroup = group !== undefined;
  const username = script.username;
  const scriptname = script.name;

  const submitInvite = async (status: boolean) => {
    try {
      await scriptAccessService.handleInvite(code, status);
      message.success(t('submit_success'));
      mutateInvite();
    } catch (error: any) {
      message.error(error.message || '操作失败，请稍后重试');
    }
  };

  const acceptInvite = () => submitInvite(true);
  const rejectInvite = () => submitInvite(false);

  // 获取状态配置
  const getStatusConfig = (status: number) => {
    const configs = {
      1: { color: 'blue', icon: <ExclamationCircleOutlined />, text: '待处理' },
      2: { color: 'green', icon: <CheckCircleOutlined />, text: '已接受' },
      3: { color: 'red', icon: <CloseCircleOutlined />, text: '已过期' },
      4: { color: 'orange', icon: <ClockCircleOutlined />, text: '等待中' },
      5: { color: 'red', icon: <CloseCircleOutlined />, text: '已拒绝' },
    };
    return configs[status as keyof typeof configs] || configs[1];
  };

  // 权限标签组件
  const PermissionTags = ({ role }: { role?: string }) => {
    if (!role) return null;

    const permissions = {
      guest: [{ text: '可读', color: 'blue' }],
      manager: [
        { text: '可读', color: 'blue' },
        { text: '可写', color: 'green' },
      ],
    };

    const rolePermissions = permissions[role as keyof typeof permissions] || [];

    return (
      <Space wrap>
        {rolePermissions.map((perm, index) => (
          <Tag key={index} color={perm.color}>
            {perm.text}
          </Tag>
        ))}
      </Space>
    );
  };

  function InviteDetail({ invite_status }: { invite_status: number }) {
    const statusConfig = getStatusConfig(invite_status);
    const inviteText = isGroup
      ? t('invite_you_join_group', {
          inviter: username,
          holder: scriptname,
          property: group?.name,
        })
      : t('invite_you_join', {
          inviter: username,
          holder: scriptname,
        });

    // 待处理状态
    if (invite_status === 1) {
      return (
        <div className="space-y-6">
          {/* 邀请信息卡片 */}
          <Card size="small" className="bg-blue-50 border-blue-200">
            <Space direction="vertical" className="w-full">
              <div className="flex items-center space-x-3">
                <Avatar icon={<UserOutlined />} />
                <div className="flex-1">
                  <Text strong>{username}</Text>
                  <Text className="text-gray-500 ml-2">邀请您</Text>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isGroup ? (
                  <TeamOutlined className="text-blue-500" />
                ) : (
                  <CodeOutlined className="text-blue-500" />
                )}
                <div className="flex-1">
                  <Text>加入 </Text>
                  <Text strong className="text-blue-600">
                    {isGroup ? group?.name : scriptname}
                  </Text>
                  {isGroup && (
                    <Tag color="purple" className="ml-2">
                      组织
                    </Tag>
                  )}
                </div>
              </div>
            </Space>
          </Card>

          {/* 权限信息 */}
          {!isGroup && access?.role && (
            <Alert
              message="权限说明"
              className="!mt-3"
              description={
                <div className="space-y-2">
                  <Text>加入后您将获得以下权限：</Text>
                  <PermissionTags role={access.role} />
                </div>
              }
              type="info"
              showIcon
            />
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4 pt-4">
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={acceptInvite}
              className="min-w-24"
            >
              {t('agree')}
            </Button>
            <Button
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={rejectInvite}
              className="min-w-24"
            >
              {t('reject')}
            </Button>
          </div>
        </div>
      );
    }

    // 其他状态统一处理
    const getResultProps = () => {
      switch (invite_status) {
        case 2:
          return {
            status: 'success' as const,
            title: '邀请已接受',
            subTitle: `${code} 已使用`,
          };
        case 3:
          return {
            status: 'error' as const,
            title: '邀请已过期',
            subTitle: `${code} 已过期`,
          };
        case 4:
          return {
            status: 'info' as const,
            title: '等待处理',
            subTitle: `${code} 等待处理中`,
          };
        case 5:
          return {
            status: 'error' as const,
            title: '邀请已拒绝',
            subTitle: `${code} 已被拒绝`,
          };
        default:
          return {
            status: 'info' as const,
            title: '未知状态',
            subTitle: '',
          };
      }
    };

    const resultProps = getResultProps();

    return (
      <div className="text-center">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Space direction="vertical" className="w-full">
            <div className="flex items-center justify-center space-x-2">
              {statusConfig.icon}
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            </div>
            <Text className="text-gray-700">{inviteText}</Text>
          </Space>
        </div>

        <Result
          status={resultProps.status}
          title={resultProps.title}
          subTitle={resultProps.subTitle}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-start justify-center p-4 pt-16">
      <Card className="w-full max-w-lg shadow-xl border-0">
        {/* 头部 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            {isGroup ? (
              <TeamOutlined className="text-2xl text-blue-600" />
            ) : (
              <CodeOutlined className="text-2xl text-blue-600" />
            )}
          </div>
          <Title level={3} className="mb-0">
            {t('invite_confirm')}
          </Title>
          <Text type="secondary">{isGroup ? '组织邀请' : '脚本协作邀请'}</Text>
        </div>

        <Divider />

        {/* 邀请详情 */}
        <InviteDetail invite_status={invite_status} />

        <Divider />

        {/* 底部操作 */}
        <div className="text-center">
          <Link href={`/script-show-page/${script.id}`}>
            <Button size="large" className="min-w-32">
              查看脚本详情
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
