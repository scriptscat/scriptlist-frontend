'use client';

import { Alert, Breadcrumb, Col, Row } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ScriptInfo } from '../types';
import ScriptNavigation from './ScriptNavigation';
import { useLocale, useTranslations } from 'next-intl';

interface ScriptLayoutProps {
  script: ScriptInfo;
  activeTab: string;
  children: React.ReactNode;
}

export default function ScriptLayout({
  script,
  activeTab,
  children,
}: ScriptLayoutProps) {
  const locale = useLocale();
  const t = useTranslations('script');
  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        className="!mb-3"
        items={[
          { href: '/', title: <HomeOutlined /> },
          { href: '/' + locale + '/search', title: t('navigation.market') },
          { title: script.name },
        ]}
      ></Breadcrumb>

      {script.archive == 1 && (
        <Alert
          message={t('alerts.archived_title')}
          description={t('alerts.archived_description')}
          type="warning"
          className="!mb-3"
          showIcon
          closable
        />
      )}

      {script.danger == 1 && (
        <Alert
          message={t('alerts.obfuscated_title')}
          description={t('alerts.obfuscated_description')}
          type="error"
          showIcon
          closable
        />
      )}

      {/* 脚本导航 */}
      <div className="mb-3">
        <ScriptNavigation activeKey={activeTab} />
      </div>

      {/* 页面内容 */}
      {children}
    </div>
  );
}
