'use client';

import { Layout, theme, Typography, Menu, Divider, Dropdown } from 'antd';
import { Header, Content, Footer } from 'antd/es/layout/layout';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import UserAuth from '@/components/UserAuth';
import {
  ChromeOutlined,
  CodeOutlined,
  GlobalOutlined,
  HomeOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import Image from 'next/image';

const { Title } = Typography;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('layout');
  const { token } = theme.useToken();
  const pathname = usePathname();

  type NavItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
  };

  const navItems: NavItem[] = [
    { href: '/', label: t('home'), icon: <HomeOutlined /> },
    {
      href: 'https://bbs.tampermonkey.net.cn',
      label: t('community'),
      icon: <MessageOutlined />,
    },
    { href: '/search', label: t('script_list'), icon: <CodeOutlined /> },
    // { href: '/developer', label: t('developer'), icon: <CodeOutlined /> },
    {
      href: 'https://docs.scriptcat.org/',
      label: t('browser_extension'),
      icon: <ChromeOutlined />,
    },
  ];

  // 用于Menu的items
  const menuItems = navItems.map((item) => ({
    key: item.href,
    label: (
      <Link
        href={item.href}
        style={{
          color: pathname === item.href ? token.colorPrimary : token.colorText,
          textDecoration: 'none',
          fontWeight: pathname === item.href ? 500 : 400,
          transition: 'color 0.2s',
        }}
        target={item.href.startsWith('http') ? '_blank' : undefined}
      >
        {item.icon} {item.label}
      </Link>
    ),
  }));

  const switchLocale = (newLocale: string) => {
    // 简单的语言切换实现
    window.location.href = `/${newLocale}${pathname}`;
  };

  return (
    <Layout style={{ backgroundColor: 'unset', minHeight: '100vh' }}>
      <Header
        style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
        className="glass dark:glass-dark sticky top-0 z-50 px-4 py-3"
      >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between"
          style={{
            height: 64,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{ textDecoration: 'none' }}
            className="flex items-center space-x-3"
          >
            <Image
              style={{
                width: '32px',
                height: '32px',
              }}
              src="/assets/logo.png"
              alt="logo"
            />
            <Title
              level={3}
              style={{
                margin: 0,
                color: '#1296DB',
                fontWeight: 'bold',
              }}
            >
              ScriptCat
            </Title>
          </Link>

          {/* Navigation Links (AntD Menu) */}
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menuItems}
            className="hidden md:flex items-center space-x-6"
            style={{
              border: 0,
              background: 'transparent',
              flex: 'none', // 防止Menu收缩
            }}
            overflowedIndicator={null} // 禁用溢出指示器
            disabledOverflow={true} // 禁用溢出处理
          />

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'en',
                    label: 'English',
                    onClick: () => switchLocale('en'),
                  },
                  {
                    key: 'zh-CN',
                    label: '简体中文',
                    onClick: () => switchLocale('zh-CN'),
                  },
                ],
                forceSubMenuRender: true,
              }}
              trigger={['click']}
              placement="bottomLeft"
            >
              <GlobalOutlined style={{ display: 'block' }} />
            </Dropdown>

            {/* User Authentication */}
            <UserAuth />
          </div>
        </div>
      </Header>
      <Content
        className="w-full max-w-7xl mx-auto px-4 py-3"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Content>
      <Footer
        className="flex flex-col items-center"
        style={{
          background: token.colorBgContainer,
        }}
      >
        <div>
          <a href="https://bbs.tampermonkey.net.cn/" target="_blank">
            {t('tampermonkey_chinese_website')}
          </a>
          <Divider type="vertical" />
          <a href="https://docs.scriptcat.org/" target="_blank">
            {t('scriptcat')}
          </a>
          <Divider type="vertical" />
          <Link href="/sitemap">{t('sitemap_title')}</Link>
          <Divider type="vertical" />
          <a href="https://github.com/scriptscat" target="_blank">
            GitHub
          </a>
        </div>
        <div>
          <a href={'https://docs.scriptcat.org/docs/use/policy/disclaimer/'}>
            {t('service_agreement')}
          </a>
          <Divider type="vertical" />
          <a
            href={'https://docs.scriptcat.org/docs/use/policy/privacy_website/'}
          >
            {t('privacy_policy')}
          </a>
        </div>
        <p className="m-0 text-sm">{t('all_rights_reserved')}</p>
      </Footer>
    </Layout>
  );
}
