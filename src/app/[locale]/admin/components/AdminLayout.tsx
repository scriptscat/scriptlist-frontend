'use client';

import type { ReactNode } from 'react';
import { Card, Layout, Menu, theme } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
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
    if (pathname.includes('/admin/oauth-apps')) return 'oauth-apps';
    return 'oauth-apps';
  };

  const menuItems: MenuItem[] = [
    {
      key: 'oauth-apps',
      icon: <ApiOutlined />,
      label: <Link href="/admin/oauth-apps">{t('oauth_apps')}</Link>,
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
