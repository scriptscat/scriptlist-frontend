'use client';

import type { ReactNode } from 'react';
import { Card, Layout, Menu, theme } from 'antd';
import {
  ApiOutlined,
  AuditOutlined,
  DiffOutlined,
  LoginOutlined,
  NotificationOutlined,
  SoundOutlined,
  UserOutlined,
  FileTextOutlined,
  MessageOutlined,
  RobotOutlined,
  StarOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import AdminMobileNav from './AdminMobileNav';
import type { AdminNavItem } from './AdminMobileNav';
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
    if (pathname.includes('/admin/reports')) return 'reports';
    if (pathname.includes('/admin/scores')) return 'scores';
    if (pathname.includes('/admin/advertise')) return 'advertise';
    if (pathname.includes('/admin/announcements')) return 'announcements';
    if (pathname.includes('/admin/system-config')) return 'system-config';
    if (pathname.includes('/admin/oidc-providers')) return 'oidc-providers';
    if (pathname.includes('/admin/oauth-apps')) return 'oauth-apps';
    if (pathname.includes('/admin/similarity')) return 'similarity';
    if (pathname.includes('/admin/ai-review/full-scan'))
      return 'ai-review-fullscan';
    if (pathname.includes('/admin/ai-review')) return 'ai-review-records';
    if (pathname.includes('/admin/script-audits')) return 'script-audits';
    return 'users';
  };

  const navItems: AdminNavItem[] = [
    {
      key: 'users',
      href: '/admin/users',
      icon: <UserOutlined />,
      label: t('users'),
    },
    {
      key: 'scripts',
      href: '/admin/scripts',
      icon: <FileTextOutlined />,
      label: t('scripts'),
    },
    {
      key: 'similarity',
      href: '/admin/similarity',
      icon: <DiffOutlined />,
      label: t('similarity'),
    },
    {
      key: 'script-audits',
      href: '/admin/script-audits',
      icon: <AuditOutlined />,
      label: t('script_audits'),
    },
    {
      key: 'ai-review',
      icon: <RobotOutlined />,
      label: t('ai_review'),
      children: [
        {
          key: 'ai-review-records',
          href: '/admin/ai-review',
          label: t('ai_review_records'),
        },
        {
          key: 'ai-review-fullscan',
          href: '/admin/ai-review/full-scan',
          label: t('ai_review_fullscan'),
        },
      ],
    },
    {
      key: 'feedbacks',
      href: '/admin/feedbacks',
      icon: <MessageOutlined />,
      label: t('feedbacks'),
    },
    {
      key: 'reports',
      href: '/admin/reports',
      icon: <WarningOutlined />,
      label: t('reports'),
    },
    {
      key: 'scores',
      href: '/admin/scores',
      icon: <StarOutlined />,
      label: t('scores'),
    },
    {
      key: 'announcements',
      href: '/admin/announcements',
      icon: <NotificationOutlined />,
      label: t('announcements'),
    },
    {
      key: 'advertise',
      href: '/admin/advertise',
      icon: <SoundOutlined />,
      label: t('advertise'),
    },
    {
      key: 'oauth-apps',
      href: '/admin/oauth-apps',
      icon: <ApiOutlined />,
      label: t('oauth_apps'),
    },
    {
      key: 'oidc-providers',
      href: '/admin/oidc-providers',
      icon: <LoginOutlined />,
      label: t('oidc_providers'),
    },
    {
      key: 'system-config',
      href: '/admin/system-config',
      icon: <SettingOutlined />,
      label: t('system_config'),
    },
  ];

  const toMenuItem = (item: AdminNavItem): MenuItem =>
    'children' in item
      ? {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children.map(toMenuItem),
        }
      : {
          key: item.key,
          icon: item.icon,
          label: <Link href={item.href}>{item.label}</Link>,
        };
  const menuItems = navItems.map(toMenuItem);

  return (
    <Card className="max-md:[&_.ant-card-body]:!p-3">
      <Layout className="h-full min-h-[calc(100vh-300px)]">
        <Sider
          width={220}
          className="max-md:!hidden"
          style={{ background: token.colorBgContainer }}
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            className="border-r-0 h-full"
          />
        </Sider>
        <Layout>
          <Content
            className="overflow-auto p-6 max-md:!p-0"
            style={{ backgroundColor: token.colorBgContainer }}
          >
            <AdminMobileNav items={navItems} selectedKey={getSelectedKey()} />
            {children}
          </Content>
        </Layout>
      </Layout>
    </Card>
  );
}
