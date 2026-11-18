'use client';

import { useRef, useState } from 'react';
import { Button, Drawer, Segmented, theme } from 'antd';
import {
  DesktopOutlined,
  ExportOutlined,
  MenuOutlined,
  MoonOutlined,
  PlusOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useLocale, useTranslations } from 'next-intl';
import { languageMap, Link, usePathname } from '@/i18n/routing';
import { useTheme } from '@/contexts/ThemeClientContext';
import type { ThemeMode } from '@/lib/cookies';
import { resolveThemeMode } from './themeMode';

export type MobileNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type Props = {
  navItems: MobileNavItem[];
  showPublish: boolean;
  onPublish: () => void;
  onSwitchLocale: (locale: string) => void;
};

// 窄屏（< md）导航：☰ 打开右侧抽屉，承载导航、发布、外观与语言
export default function MobileNavDrawer({
  navItems,
  showPublish,
  onPublish,
  onSwitchLocale,
}: Props) {
  const t = useTranslations('layout');
  const locale = useLocale();
  const pathname = usePathname();
  const { themeMode, setThemeMode } = useTheme();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

  return (
    <>
      <Button
        ref={triggerRef}
        type="text"
        className="md:!hidden !h-8 !w-8 !min-w-8"
        icon={<MenuOutlined />}
        aria-label={t('open_menu')}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      />
      <Drawer
        open={open}
        onClose={close}
        placement="right"
        size={280}
        title={t('menu')}
        // 关闭后把焦点还给 ☰（抽屉打开期间焦点锁在抽屉内）
        afterOpenChange={(visible) => {
          if (!visible) triggerRef.current?.focus();
        }}
      >
        <nav className="flex flex-col">
          {navItems.map((item) => {
            const external = item.href.startsWith('http');
            const current = !external && pathname === item.href;
            const className =
              'flex min-h-11 items-center gap-2 rounded-md px-2 text-base no-underline';
            const style = {
              color: current ? token.colorPrimary : token.colorText,
              fontWeight: current ? 500 : 400,
            };
            return external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                style={style}
                onClick={close}
              >
                {item.icon}
                <span>{item.label}</span>
                <ExportOutlined className="text-xs opacity-60" />
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={className}
                style={style}
                aria-current={current ? 'page' : undefined}
                onClick={close}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {showPublish && (
          <Button
            type="primary"
            block
            size="large"
            className="mt-4"
            icon={<PlusOutlined />}
            onClick={() => {
              close();
              onPublish();
            }}
          >
            {t('publish_script')}
          </Button>
        )}

        <div className="mt-6">
          <div className="mb-2 text-sm opacity-70">{t('appearance')}</div>
          <Segmented<ThemeMode['mode']>
            block
            size="large"
            value={themeMode.mode}
            onChange={(mode) => setThemeMode(resolveThemeMode(mode))}
            options={[
              { value: 'light', icon: <SunOutlined />, label: t('light') },
              { value: 'auto', icon: <DesktopOutlined />, label: t('system') },
              { value: 'dark', icon: <MoonOutlined />, label: t('dark') },
            ]}
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 text-sm opacity-70">{t('language')}</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(languageMap).map((key) => (
              <Button
                key={key}
                className="!min-h-9"
                type={key === locale ? 'primary' : 'default'}
                aria-pressed={key === locale}
                onClick={() => onSwitchLocale(key)}
              >
                {languageMap[key].label}
              </Button>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
}
