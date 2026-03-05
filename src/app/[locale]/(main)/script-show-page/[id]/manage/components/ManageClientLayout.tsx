'use client';

import type { ReactNode } from 'react';
import { Card, Layout, Menu, theme } from 'antd';
import {
  SettingOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  TeamOutlined,
  SyncOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface ManageClientLayoutProps {
  children: ReactNode;
  scriptId: string;
}

export default function ManageClientLayout({
  children,
  scriptId,
}: ManageClientLayoutProps) {
  const pathname = usePathname();
  const { token } = theme.useToken();
  const t = useTranslations('script.manage.navigation');

  // Extract current selected menu item from pathname
  const getSelectedKey = () => {
    if (pathname.includes('/manage/settings')) return 'settings';
    if (pathname.includes('/manage/publish')) return 'publish';
    if (pathname.includes('/manage/logs')) return 'logs';
    if (pathname.includes('/manage/access')) return 'access';
    if (pathname.includes('/manage/groups')) return 'groups';
    if (pathname.endsWith('/manage')) return 'manage'; // Manage page itself (original sync content)
    return 'manage'; // Default selected manage page
  };

  const menuItems: MenuItem[] = [
    {
      key: 'manage',
      icon: <SyncOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage`}>
          {t('source_sync')}
        </Link>
      ),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/settings`}>
          {t('script_settings')}
        </Link>
      ),
    },
    {
      key: 'publish',
      icon: <CloudUploadOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/publish`}>
          {t('script_publish')}
        </Link>
      ),
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/logs`}>
          {t('manage_logs')}
        </Link>
      ),
    },
    {
      key: 'access',
      icon: <EyeOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/access`}>
          {t('access_control')}
        </Link>
      ),
    },
    {
      key: 'groups',
      icon: <TeamOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/groups`}>
          {t('group_management')}
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <Layout className="h-full bg-white dark:bg-gray-900">
        <Sider width={250} className="shadow-sm bg-white dark:bg-gray-800">
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            className="border-r-0 h-full"
          />
        </Sider>

        <Layout>
          <Content
            className="overflow-auto p-6 bg-gray-50 dark:bg-gray-900"
            style={{
              backgroundColor: token.colorBgContainer,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Card>
  );
}
