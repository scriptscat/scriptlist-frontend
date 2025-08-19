'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'antd';
import {
  BookOutlined,
  CodeOutlined,
  MessageOutlined,
  StarOutlined,
  HistoryOutlined,
  EditOutlined,
  BarChartOutlined,
  SettingOutlined,
  BugOutlined,
} from '@ant-design/icons';
import useToken from 'antd/es/theme/useToken';
import { useUser } from '@/contexts/UserContext';
import { useScript } from './ScriptContext';

interface ScriptNavigationProps {
  activeKey: string;
}

export default function ScriptNavigation({ activeKey }: ScriptNavigationProps) {
  const params = useParams();
  const user = useUser();
  const script = useScript();
  const [_, token] = useToken();
  const { locale, id } = params;

  const menuItems = [
    {
      key: 'overview',
      icon: <BookOutlined />,
      label: <Link href={`/${locale}/script-show-page/${id}`}>首页</Link>,
    },
    {
      key: 'code',
      icon: <CodeOutlined />,
      label: <Link href={`/${locale}/script-show-page/${id}/code`}>代码</Link>,
    },
    {
      key: 'issue',
      icon: <BugOutlined />,
      label: <Link href={`/${locale}/script-show-page/${id}/issue`}>反馈</Link>,
    },
    {
      key: 'comment',
      icon: <StarOutlined />,
      label: (
        <Link href={`/${locale}/script-show-page/${id}/comment`}>评分</Link>
      ),
    },
    {
      key: 'version',
      icon: <HistoryOutlined />,
      label: (
        <Link href={`/${locale}/script-show-page/${id}/version`}>版本列表</Link>
      ),
    },
  ];

  if (
    user.user &&
    (user.user.user_id === script.script.user_id ||
      user.user.is_admin === 1 ||
      script.script.role === 'manager')
  ) {
    menuItems.push(
      ...[
        {
          key: 'update',
          icon: <EditOutlined />,
          label: (
            <Link href={`/${locale}/script-show-page/${id}/update`}>
              更新脚本
            </Link>
          ),
        },
        {
          key: 'statistic',
          icon: <BarChartOutlined />,
          label: (
            <Link href={`/${locale}/script-show-page/${id}/statistic`}>
              脚本统计
            </Link>
          ),
        },
        {
          key: 'manage',
          icon: <SettingOutlined />,
          label: (
            <Link href={`/${locale}/script-show-page/${id}/manage`}>
              脚本管理
            </Link>
          ),
        },
      ],
    );
  }

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[activeKey]}
      items={menuItems}
      className="w-full shadow-sm"
      style={{ borderRadius: '12px', border: '1px solid ' + token.colorBorder }}
    />
  );
}
