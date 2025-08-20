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
  const t = useTranslations();
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

      {script.archive == 1 && (
        <Alert
          message={'脚本已归档'}
          description={
            '该脚本已经被作者归档，脚本可能失效并且作者不再维护，你无法再进行问题反馈。'
          }
          type="warning"
          className="!mb-3"
          showIcon
          closable
        />
      )}

      {script.danger == 1 && (
        <Alert
          message={'脚本代码经过了不可读处理'}
          description={t('script_code_obfuscated_description')}
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
