'use client';

import React from 'react';
import { Button, Avatar, Dropdown, Space } from 'antd';
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function UserAuth() {
  const { user, login, logout } = useUser();
  const t = useTranslations('layout');
  const router = useRouter();

  if (!user) {
    return (
      <Button
        type="primary"
        ghost
        icon={<LoginOutlined />}
        onClick={login}
        size="small"
      >
        {t('login')}
      </Button>
    );
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: t('user_profile'),
      icon: <UserOutlined />,
      onClick: () => {
        router.push(`/users/${user.user_id}`);
      },
    },
    {
      key: 'settings',
      label: t('user_setting'),
      icon: <SettingOutlined />,
      onClick: () => {
        router.push('/users/settings');
      },
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: t('logout'),
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: userMenuItems,
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Space style={{ cursor: 'pointer' }}>
        <Avatar
          size="small"
          src={user.avatar}
          icon={!user.avatar && <UserOutlined />}
        />
        <span className="hidden lg:inline">{user.username}</span>
      </Space>
    </Dropdown>
  );
}
