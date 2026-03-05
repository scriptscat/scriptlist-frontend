'use client';

import type { ReactNode } from 'react';
import { Card, Layout, Menu, theme } from 'antd';
import {
  ApiOutlined,
  LoginOutlined,
  UserOutlined,
  FileTextOutlined,
  MessageOutlined,
  StarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { token } = theme.useToken();
  const t = useTranslations('admin.navigation');

  const getSelectedKey = () => {
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/scripts')) return 'scripts';
    if (pathname.includes('/admin/feedbacks')) return 'feedbacks';
    if (pathname.includes('/admin/scores')) return 'scores';
    if (pathname.includes('/admin/system-config')) return 'system-config';
    if (pathname.includes('/admin/oidc-providers')) return 'oidc-providers';
    if (pathname.includes('/admin/oauth-apps')) return 'oauth-apps';
    return 'users';
  };

  const menuItems: MenuItem[] = [
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link href="/admin/users">{t('users')}</Link>,
    },
    {
      key: 'scripts',
      icon: <FileTextOutlined />,
      label: <Link href="/admin/scripts">{t('scripts')}</Link>,
    },
    {
      key: 'feedbacks',
      icon: <MessageOutlined />,
      label: <Link href="/admin/feedbacks">{t('feedbacks')}</Link>,
    },
    {
      key: 'scores',
      icon: <StarOutlined />,
      label: <Link href="/admin/scores">{t('scores')}</Link>,
    },
    {
      key: 'oauth-apps',
      icon: <ApiOutlined />,
      label: <Link href="/admin/oauth-apps">{t('oauth_apps')}</Link>,
    },
    {
      key: 'oidc-providers',
      icon: <LoginOutlined />,
      label: <Link href="/admin/oidc-providers">{t('oidc_providers')}</Link>,
    },
    {
      key: 'system-config',
      icon: <SettingOutlined />,
      label: <Link href="/admin/system-config">{t('system_config')}</Link>,
    },
  ];

  return (
    <Card>
      <Layout className="h-full min-h-[calc(100vh-300px)]">
        <Sider width={220} style={{ background: token.colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            className="border-r-0 h-full"
          />
        </Sider>
        <Layout>
          <Content
            className="overflow-auto p-6"
            style={{ backgroundColor: token.colorBgContainer }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Card>
  );
}
