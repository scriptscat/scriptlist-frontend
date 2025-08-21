'use client';

import React from 'react';
import {
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
import type { InviteMessage } from '@/app/[locale]/script-show-page/[id]/types';
import type { APIError } from '@/types/api';
import { Link } from '@/i18n/routing';

const { Title, Text } = Typography;

export default function InviteConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const t = useTranslations('script.invite');

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <Result
            status="error"
            title={t('get_invite_info_failed')}
            subTitle={error.message || t('check_invite_link')}
            extra={[
              <Button
                type="primary"
                key="home"
                onClick={() => router.push('/')}
              >
                {t('back_to_home')}
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">{t('loading_invite_info')}</div>
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
      message.error(error.message || t('operation_failed_retry'));
    }
  };

  const acceptInvite = () => submitInvite(true);
  const rejectInvite = () => submitInvite(false);

  // 获取状态配置
  const getStatusConfig = (status: number) => {
    const configs = {
      1: {
        color: 'blue',
        icon: <ExclamationCircleOutlined />,
        text: t('status_pending'),
      },
      2: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        text: t('status_accepted'),
      },
      3: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        text: t('status_expired'),
      },
      4: {
        color: 'orange',
        icon: <ClockCircleOutlined />,
        text: t('status_waiting'),
      },
      5: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        text: t('status_rejected'),
      },
    };
    return configs[status as keyof typeof configs] || configs[1];
  };

  // 权限标签组件
  const PermissionTags = ({ role }: { role?: string }) => {
    if (!role) return null;

    const permissions = {
      guest: [{ text: t('permission_read'), color: 'blue' }],
      manager: [
        { text: t('permission_read'), color: 'blue' },
        { text: t('permission_write'), color: 'green' },
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
          <Card size="small">
            <Space direction="vertical" className="w-full">
              <div className="flex items-center space-x-3">
                <Avatar icon={<UserOutlined />} />
                <div className="flex-1">
                  <Text strong>{username}</Text>
                  <Text className="text-gray-500 ml-2">{t('invite_you')}</Text>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isGroup ? (
                  <TeamOutlined className="text-blue-500" />
                ) : (
                  <CodeOutlined className="text-blue-500" />
                )}
                <div className="flex-1">
                  <Text>{t('join')} </Text>
                  <Text strong className="text-blue-600">
                    {isGroup ? group?.name : scriptname}
                  </Text>
                  {isGroup && (
                    <Tag color="purple" className="ml-2">
                      {t('organization')}
                    </Tag>
                  )}
                </div>
              </div>
            </Space>
          </Card>

          {/* 权限信息 */}
          {!isGroup && access?.role && (
            <Alert
              message={t('permission_description')}
              className="!mt-3"
              description={
                <div className="space-y-2">
                  <Text>{t('permission_after_join')}</Text>
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
            title: t('invite_accepted'),
            subTitle: t('code_used', { code: code || '' }),
          };
        case 3:
          return {
            status: 'error' as const,
            title: t('invite_expired'),
            subTitle: t('code_expired', { code: code || '' }),
          };
        case 4:
          return {
            status: 'info' as const,
            title: t('waiting_process'),
            subTitle: t('code_waiting', { code: code || '' }),
          };
        case 5:
          return {
            status: 'error' as const,
            title: t('invite_rejected'),
            subTitle: t('code_rejected', { code: code || '' }),
          };
        default:
          return {
            status: 'info' as const,
            title: t('unknown_status'),
            subTitle: '',
          };
      }
    };

    const resultProps = getResultProps();

    return (
      <div className="text-center">
        <div className="mb-6 p-4 rounded-lg">
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
          <Text type="secondary">
            {isGroup
              ? t('organization_invite')
              : t('script_collaboration_invite')}
          </Text>
        </div>

        <Divider />

        {/* 邀请详情 */}
        <InviteDetail invite_status={invite_status} />

        <Divider />

        {/* 底部操作 */}
        <div className="text-center">
          <Link href={`/script-show-page/${script.id}`}>
            <Button size="large" className="min-w-32">
              {t('view_script_details')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
