'use client';

import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from '@/i18n/routing';
import { useUnreadCount } from '@/lib/api/hooks/notification';

/**
 * 顶栏未读通知铃铛。
 *
 * 未读数没有 SSR 种子（`useUnreadCount` 是纯客户端 SWR），所以首屏一定先画一个
 * 没有角标的铃铛，几百毫秒后角标才出现。外层这个固定 24×24 的格子就是为此存在：
 * 无论角标有没有、是 1 位还是 3 位数，铃铛在顶栏 flex 行里占的宽高都不变，
 * 右侧的头像 / 按钮不会被推动，角标也有地方溢出而不至于压到邻居身上。
 */
export default function NotificationBell() {
  const { data: unreadCount } = useUnreadCount();

  return (
    <Link href="/notifications">
      <span
        data-testid="notification-bell-slot"
        className="inline-flex h-6 w-6 items-center justify-center"
      >
        <Badge count={unreadCount?.total || 0} showZero={false} size="small">
          <BellOutlined />
        </Badge>
      </span>
    </Link>
  );
}
