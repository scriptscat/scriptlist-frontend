'use client';

import { Skeleton } from 'antd';

/**
 * 通知列表的加载骨架。
 *
 * 之前这里是 `<Skeleton active paragraph={{ rows: 4 }} />`：一个 5 行高的小方块，
 * 而真实数据是 20 条列表项，卡片会在数据到达时从一百多 px 暴涨到上千 px。
 * 这里按真实条目排布，行高与 `renderItem` 的 `!px-3 !py-2.5` 对齐：
 * 32px 圆形头像 + 70% 标题行 + 90% 正文行 + 右对齐的 60px 时间戳。
 */
export interface NotificationListSkeletonProps {
  /** 行数，默认 10。真实每页 20 条，10 行足以撑住首屏而不至于画一屏半的灰条。 */
  count?: number;
  /** 已翻译好的无障碍文案。 */
  label?: string;
  className?: string;
}

export function NotificationListSkeleton({
  count = 10,
  label,
  className = '',
}: NotificationListSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="notification-list-skeleton"
      className={`divide-y divide-gray-100 dark:divide-gray-800 ${className}`.trim()}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          data-testid="notification-list-skeleton-item"
          className="flex items-start gap-3 px-3 py-2.5"
        >
          <Skeleton.Avatar active shape="circle" size={32} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton.Input
              active
              size="small"
              style={{ width: '70%', minWidth: 0, height: 16 }}
            />
            <Skeleton.Input
              active
              size="small"
              style={{ width: '90%', minWidth: 0, height: 14 }}
            />
          </div>
          <Skeleton.Input
            active
            size="small"
            style={{ width: 60, minWidth: 60, height: 14 }}
            className="shrink-0"
          />
        </div>
      ))}
    </div>
  );
}

export default NotificationListSkeleton;
