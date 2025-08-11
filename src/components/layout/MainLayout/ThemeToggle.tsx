'use client';

import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { MoonOutlined, SunOutlined, DesktopOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeClientContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();
  const t = useTranslations();

  const getIcon = () => {
    switch (themeMode.mode) {
      case 'light':
        return <SunOutlined />;
      case 'dark':
        return <MoonOutlined />;
      case 'auto':
        return <DesktopOutlined />;
      default:
        return <DesktopOutlined />;
    }
  };

  return (
    <Dropdown
      menu={{
        selectedKeys: [themeMode.mode],
        onClick: ({ key }) => {
          setThemeMode({
            mode: key as 'light' | 'dark' | 'auto',
            theme: key === 'dark' ? 'dark' : 'light',
          });
        },
        items: [
          {
            label: (
              <Space>
                <SunOutlined />
                <span className="text-sm">{t('light')}</span>
              </Space>
            ),
            key: 'light',
          },
          {
            label: (
              <Space>
                <MoonOutlined />
                <span className="text-sm">{t('dark')}</span>
              </Space>
            ),
            key: 'dark',
          },
          {
            label: (
              <Space>
                <DesktopOutlined />
                <span className="text-sm">{t('system')}</span>
              </Space>
            ),
            key: 'auto',
          },
        ],
      }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <Button
        type="text"
        icon={getIcon()}
        size="small"
        className="flex items-center justify-center theme-transition hover:bg-app-tertiary"
      />
    </Dropdown>
  );
};
