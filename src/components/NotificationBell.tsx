'use client';

import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from '@/i18n/routing';
import { useUnreadCount } from '@/lib/api/hooks/notification';

export default function NotificationBell() {
  const { data: unreadCount } = useUnreadCount();

  return (
    <Link href="/notifications">
      <Badge count={unreadCount?.total || 0} showZero={false} size="small">
        <BellOutlined />
      </Badge>
    </Link>
  );
}
