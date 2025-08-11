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

  // 从 pathname 中提取当前选中的菜单项
  const getSelectedKey = () => {
    if (pathname.includes('/manage/settings')) return 'settings';
    if (pathname.includes('/manage/publish')) return 'publish';
    if (pathname.includes('/manage/logs')) return 'logs';
    if (pathname.includes('/manage/access')) return 'access';
    if (pathname.includes('/manage/groups')) return 'groups';
    if (pathname.endsWith('/manage')) return 'manage'; // 管理页面本身（原sync内容）
    return 'manage'; // 默认选中管理页面
  };

  const menuItems: MenuItem[] = [
    {
      key: 'manage',
      icon: <SyncOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage`}>源代码同步</Link>
      ),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/settings`}>
          脚本管理
        </Link>
      ),
    },
    {
      key: 'publish',
      icon: <CloudUploadOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/publish`}>
          脚本发布
        </Link>
      ),
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/logs`}>管理日志</Link>
      ),
    },
    {
      key: 'access',
      icon: <EyeOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/access`}>
          访问权限管理
        </Link>
      ),
    },
    {
      key: 'groups',
      icon: <TeamOutlined />,
      label: (
        <Link href={`/script-show-page/${scriptId}/manage/groups`}>
          用户组管理
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
