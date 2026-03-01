'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Menu, Space, theme } from 'antd';
import {
  BookOutlined,
  CodeOutlined,
  StarOutlined,
  HistoryOutlined,
  EditOutlined,
  BarChartOutlined,
  SettingOutlined,
  BugOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useUser } from '@/contexts/UserContext';
import { useScript, useScriptState } from './ScriptContext';
import { useMemo } from 'react';

interface ScriptNavigationProps {
  activeKey: string;
}

export default function ScriptNavigation({ activeKey }: ScriptNavigationProps) {
  const params = useParams();
  const user = useUser();
  const script = useScript();
  const scriptState = useScriptState();
  const { token } = theme.useToken();
  const t = useTranslations('script.navigation');
  const { locale, id } = params;

  const menuItems = useMemo(() => {
    const items = [
      {
        key: 'overview',
        icon: <BookOutlined />,
        label: (
          <Link href={`/${locale}/script-show-page/${id}`}>
            {t('overview')}
          </Link>
        ),
      },
      {
        key: 'code',
        icon: <CodeOutlined />,
        label: (
          <Link href={`/${locale}/script-show-page/${id}/code`}>
            {t('code')}
          </Link>
        ),
      },
      {
        key: 'issue',
        icon: <BugOutlined />,
        label: (
          <Space>
            <Link href={`/${locale}/script-show-page/${id}/issue`}>
              {t('issue')}
            </Link>
            {scriptState?.issue_count > 0 && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium leading-4 bg-gray-300 text-white dark:text-gray-200 dark:bg-gray-600 rounded-full">
                {scriptState?.issue_count}
              </span>
            )}
          </Space>
        ),
      },
      {
        key: 'comment',
        icon: <StarOutlined />,
        label: (
          <Link href={`/${locale}/script-show-page/${id}/comment`}>
            {t('comment')}
          </Link>
        ),
      },
      {
        key: 'version',
        icon: <HistoryOutlined />,
        label: (
          <Link href={`/${locale}/script-show-page/${id}/version`}>
            {t('version')}
          </Link>
        ),
      },
    ];

    if (scriptState?.report_count > 0) {
      // 插入到反馈(issue)后面
      const issueIndex = items.findIndex((item) => item.key === 'issue');
      items.splice(issueIndex + 1, 0, {
        key: 'report',
        icon: <AlertOutlined />,
        label: (
          <Space>
            <Link href={`/${locale}/script-show-page/${id}/report`}>
              {t('report')}
            </Link>
            <span className="inline-block px-2 py-0.5 text-xs font-medium leading-4 bg-red-500 text-white rounded-full">
              {scriptState.report_count}
            </span>
          </Space>
        ),
      });
    }

    if (
      user.user &&
      (user.user.user_id === script.script.user_id ||
        user.user.is_admin === 1 ||
        script.script.role === 'manager')
    ) {
      items.push(
        {
          key: 'update',
          icon: <EditOutlined />,
          label: (
            <Link href={`/${locale}/script-show-page/${id}/update`}>
              {t('update')}
            </Link>
          ),
        },
        {
          key: 'statistic',
          icon: <BarChartOutlined />,
          label: (
            <Link href={`/${locale}/script-show-page/${id}/statistic`}>
              {t('statistic')}
            </Link>
          ),
        },
        {
          key: 'manage',
          icon: <SettingOutlined />,
          label: (
            <Link href={`/${locale}/script-show-page/${id}/manage`}>
              {t('manage')}
            </Link>
          ),
        },
      );
    }

    return items;
  }, [
    locale,
    id,
    t,
    user.user,
    script.script.user_id,
    script.script.role,
    scriptState,
  ]);

  const menuStyle = useMemo(
    () => ({
      borderRadius: '12px',
      border: '1px solid ' + token.colorBorder,
    }),
    [token.colorBorder],
  );

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[activeKey]}
      items={menuItems}
      className="w-full shadow-sm"
      style={menuStyle}
    />
  );
}
