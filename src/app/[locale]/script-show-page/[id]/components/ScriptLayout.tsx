'use client';

import { Breadcrumb, Col, Row } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { ScriptInfo } from '../types';
import ScriptNavigation from './ScriptNavigation';
import { useLocale } from 'next-intl';

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
  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        className="!mb-3"
        items={[
          { href: '/', title: <HomeOutlined /> },
          { href: '/' + locale + '/search', title: '脚本市场' },
          { title: script.name },
        ]}
      ></Breadcrumb>

      {/* 脚本导航 */}
      <div className="mb-2">
        <ScriptNavigation activeKey={activeTab} />
      </div>

      {/* 页面内容 */}
      {children}
    </div>
  );
}
