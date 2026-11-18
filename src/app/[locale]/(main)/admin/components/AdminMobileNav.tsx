'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Drawer, theme } from 'antd';
import { DownOutlined, MenuOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type AdminNavBase = {
  key: string;
  label: string;
  icon?: ReactNode;
};

// 叶子项必有 href；分组只有标题和子项，自身不可点
export type AdminNavLeaf = AdminNavBase & { href: string };
export type AdminNavGroup = AdminNavBase & { children: AdminNavLeaf[] };
export type AdminNavItem = AdminNavLeaf | AdminNavGroup;

type Props = {
  items: AdminNavItem[];
  selectedKey: string;
};

// 当前页名称；子菜单页显示为「父 · 子」
function currentLabel(items: AdminNavItem[], selectedKey: string): string {
  for (const item of items) {
    if (item.key === selectedKey) return item.label;
    if (!('children' in item)) continue;
    const child = item.children.find((c) => c.key === selectedKey);
    if (child) return `${item.label} · ${child.label}`;
  }
  return '';
}

// 窄屏（< md）管理后台导航：内容区顶部的触发按钮，打开底部菜单
export default function AdminMobileNav({ items, selectedKey }: Props) {
  const t = useTranslations('admin.navigation');
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

  const linkClass =
    'flex min-h-11 items-center gap-2 rounded-md px-2 text-base no-underline';

  const renderLeaf = (item: AdminNavLeaf, indent: boolean) => {
    const current = item.key === selectedKey;
    return (
      <Link
        key={item.key}
        href={item.href}
        className={`${linkClass}${indent ? ' pl-8' : ''}`}
        style={{
          color: current ? token.colorPrimary : token.colorText,
          fontWeight: current ? 500 : 400,
          backgroundColor: current ? token.colorPrimaryBg : undefined,
        }}
        aria-current={current ? 'page' : undefined}
        onClick={close}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="md:!hidden mb-3 flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md border px-3 text-left text-base"
        style={{
          color: token.colorText,
          backgroundColor: token.colorBgContainer,
          borderColor: token.colorBorder,
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <MenuOutlined />
        <span className="shrink-0">{t('title')}</span>
        <span className="opacity-50">{'/'}</span>
        <span className="min-w-0 flex-1 truncate font-medium">
          {currentLabel(items, selectedKey)}
        </span>
        <DownOutlined className="text-xs opacity-60" />
      </button>
      <Drawer
        open={open}
        onClose={close}
        placement="bottom"
        size="75vh"
        title={t('title')}
        // 关闭后把焦点还给触发按钮（打开期间焦点锁在抽屉内）
        afterOpenChange={(visible) => {
          if (!visible) triggerRef.current?.focus();
        }}
      >
        <nav className="flex flex-col">
          {items.map((item) =>
            'children' in item ? (
              <div key={item.key} className="flex flex-col">
                <div className={`${linkClass} opacity-70`}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.children.map((child) => renderLeaf(child, true))}
              </div>
            ) : (
              renderLeaf(item, false)
            ),
          )}
        </nav>
      </Drawer>
    </>
  );
}
