'use client';

import {
  Layout,
  theme,
  Typography,
  Menu,
  Divider,
  Dropdown,
  Button,
  message,
  Badge,
} from 'antd';
const { Header, Content, Footer } = Layout;
import { useTranslations } from 'next-intl';
import { languageMap, Link, usePathname, useRouter } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import UserAuth from '@/components/UserAuth';
import { useUser } from '@/contexts/UserContext';
import NotificationBell from '@/components/NotificationBell';
import {
  BellOutlined,
  ChromeOutlined,
  CodeOutlined,
  GlobalOutlined,
  HomeOutlined,
  MessageOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';

const { Title } = Typography;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('layout');
  const { token } = theme.useToken();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const handlePublishScript = useCallback(() => {
    if (!user) {
      message.warning(t('login_required'));
      return;
    }
    // 跳转到发布脚本页面
    router.push('/scripts/create');
  }, [user, t, router]);

  type NavItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
  };

  const navItems: NavItem[] = useMemo(
    () => [
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
    ],
    [t],
  );

  // 用于Menu的items
  const menuItems = useMemo(
    () =>
      navItems.map((item) => ({
        key: item.href,
        label: (
          <Link
            href={item.href}
            style={{
              color:
                pathname === item.href ? token.colorPrimary : token.colorText,
              textDecoration: 'none',
              fontWeight: pathname === item.href ? 500 : 400,
              transition: 'color 0.2s',
            }}
            target={item.href.startsWith('http') ? '_blank' : undefined}
          >
            {item.icon} {item.label}
          </Link>
        ),
      })),
    [navItems, pathname, token.colorPrimary, token.colorText],
  );

  const switchLocale = useCallback(
    (newLocale: string) => {
      // 简单的语言切换实现
      window.location.assign(`/${newLocale}${pathname}`);
    },
    [pathname],
  );

  const languageMenuProps = useMemo(
    () => ({
      items: Object.keys(languageMap).map((key) => ({
        key: key,
        label: `${languageMap[key].label} (${key})`,
        onClick: () => switchLocale(key),
      })),
      forceSubMenuRender: true,
    }),
    [switchLocale],
  );

  // 聊天页使用独立布局：无 Footer，全屏高度，无外层滚动
  const isFullscreenPage = pathname.startsWith('/chat');

  return (
    <Layout
      style={{
        backgroundColor: 'unset',
        ...(isFullscreenPage
          ? { height: '100vh', overflow: 'hidden' }
          : { minHeight: '100vh' }),
      }}
    >
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
            <Image height={32} width={32} src="/assets/logo.png" alt="logo" />
            <Title
              level={3}
              style={{
                margin: 0,
                color: '#1296DB',
                fontWeight: 'bold',
              }}
              className="!text-xl md:!text-2xl"
            >
              {'ScriptCat'}
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
            {/* Publish Script Button */}
            {user && (
              <>
                <Button
                  className="!hidden sm:!inline-flex"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handlePublishScript}
                  size="small"
                >
                  {t('publish_script')}
                </Button>

                {/* Notification Bell */}
                <NotificationBell />
              </>
            )}

            {/* AI Chat - 暂时注释，后续版本恢复 */}
            {/* <button
              onClick={() => router.push('/chat')}
              className="!hidden sm:!inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white cursor-pointer border-0 transition-all duration-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.5)] hover:scale-105"
              style={{
                background:
                  'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
                backgroundSize: '200% 200%',
                animation: 'ai-gradient 3s ease infinite',
              }}
            >
              <Icon icon="mingcute:robot-line" width="14" height="14" />
              {t('ai_chat')}
            </button>
            <style jsx>{`
              @keyframes ai-gradient {
                0%,
                100% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
              }
            `}</style> */}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <Dropdown
              menu={languageMenuProps}
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
        className={isFullscreenPage ? '' : 'w-full max-w-7xl mx-auto px-4 py-4'}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ...(isFullscreenPage ? { overflow: 'hidden' } : {}),
        }}
      >
        {children}
      </Content>
      {!isFullscreenPage && (
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
            <a href="https://github.com/scriptscat" target="_blank">
              {'GitHub'}
            </a>
          </div>
          <div>
            <a href={'https://docs.scriptcat.org/docs/use/policy/disclaimer/'}>
              {t('service_agreement')}
            </a>
            <Divider type="vertical" />
            <a
              href={
                'https://docs.scriptcat.org/docs/use/policy/privacy_website/'
              }
            >
              {t('privacy_policy')}
            </a>
          </div>
          <p className="m-0 text-sm">{t('all_rights_reserved')}</p>
        </Footer>
      )}
    </Layout>
  );
}
