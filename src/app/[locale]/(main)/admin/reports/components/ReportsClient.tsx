'use client';

import { useCallback, useState } from 'react';
import { Badge, Tabs } from 'antd';
import { useTranslations } from 'next-intl';
import { useAdminContentReportPendingCount } from '@/lib/api/hooks/admin';
import ContentReportsPanel from './ContentReportsPanel';
import ScriptReportsPanel from './ScriptReportsPanel';
import { parseReportTab } from './reportTabs';
import type { ReportTab } from './reportTabs';

interface ReportsClientProps {
  /** 服务端从 `?tab` 读到的原始值 */
  initialTab?: string;
}

export default function ReportsClient({ initialTab }: ReportsClientProps) {
  const t = useTranslations('admin.reports');
  const [tab, setTab] = useState<ReportTab>(parseReportTab(initialTab));
  const { count: pendingCount } = useAdminContentReportPendingCount();

  // 不触发导航，只让刷新后停留在同一页签
  const handleTabChange = useCallback((key: string) => {
    const next = parseReportTab(key);
    setTab(next);
    const url = new URL(window.location.href);
    if (next === 'content') url.searchParams.set('tab', 'content');
    else url.searchParams.delete('tab');
    window.history.replaceState(null, '', url);
  }, []);

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">{t('title')}</h2>
      <Tabs
        activeKey={tab}
        onChange={handleTabChange}
        items={[
          {
            key: 'script',
            label: t('tab_script'),
            children: <ScriptReportsPanel />,
          },
          {
            key: 'content',
            label: (
              <span>
                {t('tab_content')}
                <Badge
                  count={pendingCount}
                  overflowCount={99}
                  size="small"
                  className="ml-2"
                />
              </span>
            ),
            children: <ContentReportsPanel />,
          },
        ]}
      />
    </div>
  );
}
