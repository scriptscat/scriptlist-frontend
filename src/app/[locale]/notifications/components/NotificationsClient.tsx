'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, List, Badge, Tag, Button, Tabs, Pagination, message } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  MessageOutlined,
  UserAddOutlined,
  FileTextOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type {
  Notification,
  UnreadCountResponse,
} from '@/lib/api/services/notification';
import { NotificationType } from '@/lib/api/services/notification';
import {
  batchMarkNotificationRead,
  markNotificationRead,
} from '@/lib/api/hooks/notification';
import { useSemDateTime } from '@/lib/utils/semdate';
import Link from 'next/link';

interface NotificationsClientProps {
  initialNotifications: Notification[];
  totalCount: number;
  initialPage: number;
  initialReadStatus?: 1 | 2;
  initialType?: number;
  unreadCount: UnreadCountResponse;
}

const NotificationTypeIcon: Record<NotificationType, React.ReactNode> = {
  [NotificationType.SYSTEM]: <BellOutlined />,
  [NotificationType.SCRIPT]: <FileTextOutlined />,
  [NotificationType.COMMENT]: <MessageOutlined />,
  [NotificationType.FOLLOW]: <UserAddOutlined />,
  [NotificationType.INVITE]: <MailOutlined />,
};

const NotificationTypeLabel: Record<NotificationType, string> = {
  [NotificationType.SYSTEM]: '系统通知',
  [NotificationType.SCRIPT]: '脚本',
  [NotificationType.COMMENT]: '评论',
  [NotificationType.FOLLOW]: '关注',
  [NotificationType.INVITE]: '邀请',
};

export default function NotificationsClient({
  initialNotifications,
  totalCount,
  initialPage,
  initialReadStatus,
  initialType,
  unreadCount,
}: NotificationsClientProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const formatTime = useSemDateTime();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentReadStatus, setCurrentReadStatus] = useState<
    'all' | 'unread' | 'read'
  >(
    initialReadStatus === 1
      ? 'unread'
      : initialReadStatus === 2
        ? 'read'
        : 'all',
  );
  const [currentType, setCurrentType] = useState<number | undefined>(
    initialType,
  );
  const [loading, setLoading] = useState(false);

  // 构建URL参数
  const buildUrl = (params: {
    page?: number;
    readStatus?: 'all' | 'unread' | 'read';
    type?: number;
  }) => {
    const searchParams = new URLSearchParams();
    const page = params.page || currentPage;
    const readStatus = params.readStatus || currentReadStatus;
    const type = params.type !== undefined ? params.type : currentType;

    if (page > 1) searchParams.set('page', page.toString());
    if (readStatus === 'unread') searchParams.set('read_status', '1');
    if (readStatus === 'read') searchParams.set('read_status', '2');
    if (type !== undefined) searchParams.set('type', type.toString());

    const query = searchParams.toString();
    return `/notifications${query ? `?${query}` : ''}`;
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(buildUrl({ page }));
  };

  // 处理筛选变化
  const handleTabChange = (key: string) => {
    const readStatus = key as 'all' | 'unread' | 'read';
    setCurrentReadStatus(readStatus);
    setCurrentPage(1);
    router.push(buildUrl({ page: 1, readStatus }));
  };

  // 处理类型筛选
  const handleTypeChange = (type?: number) => {
    setCurrentType(type);
    setCurrentPage(1);
    router.push(buildUrl({ page: 1, type }));
  };

  // 标记单个通知为已读
  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      // 更新本地状态
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: 1 } : n)),
      );
      message.success(t('mark_read_success'));
      router.refresh();
    } catch (error) {
      message.error(t('mark_read_error'));
    }
  };

  // 批量标记已读
  const handleBatchMarkRead = async () => {
    setLoading(true);
    try {
      const result = await batchMarkNotificationRead({
        type: currentType,
      });
      message.success(t('batch_mark_read_success', { count: result.count }));
      router.refresh();
    } catch (error) {
      message.error(t('batch_mark_read_error'));
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          {t('all')}
          {unreadCount.total > 0 && (
            <Badge
              count={unreadCount.total}
              style={{ marginLeft: 8 }}
              showZero={false}
            />
          )}
        </span>
      ),
    },
    {
      key: 'unread',
      label: (
        <span>
          {t('unread')}
          {unreadCount.total > 0 && (
            <Badge
              count={unreadCount.total}
              style={{ marginLeft: 8 }}
              showZero={false}
            />
          )}
        </span>
      ),
    },
    {
      key: 'read',
      label: t('read'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card
        title={
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BellOutlined />
              {t('title')}
            </h1>
            {unreadCount.total > 0 && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleBatchMarkRead}
                loading={loading}
              >
                {t('mark_all_read')}
              </Button>
            )}
          </div>
        }
      >
        <Tabs
          activeKey={currentReadStatus}
          onChange={handleTabChange}
          items={tabItems}
          className="mb-4"
        />

        {/* 类型筛选 */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <Button
            type={currentType === undefined ? 'primary' : 'default'}
            onClick={() => handleTypeChange(undefined)}
            size="small"
          >
            {t('all_types')}
          </Button>
          {Object.entries(NotificationTypeLabel).map(([type, label]) => {
            const typeNum = parseInt(type);
            const count = unreadCount.items.find((item) => item.type === typeNum)
              ?.count;
            return (
              <Button
                key={type}
                type={currentType === typeNum ? 'primary' : 'default'}
                onClick={() => handleTypeChange(typeNum)}
                size="small"
                icon={NotificationTypeIcon[typeNum as NotificationType]}
              >
                {label}
                {count && count > 0 && (
                  <Badge
                    count={count}
                    style={{ marginLeft: 4 }}
                    showZero={false}
                  />
                )}
              </Button>
            );
          })}
        </div>

        <List
          dataSource={notifications}
          locale={{
            emptyText: t('empty'),
          }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              className={`${item.read_status === 0 ? 'bg-blue-50 dark:bg-blue-950' : ''} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
              actions={[
                <span key="time" className="text-gray-500 text-sm">
                  {formatTime(item.createtime)}
                </span>,
                item.read_status === 0 && (
                  <Button
                    key="mark-read"
                    type="link"
                    size="small"
                    onClick={() => handleMarkRead(item.id)}
                  >
                    {t('mark_as_read')}
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="flex items-center gap-2">
                    {item.read_status === 0 && (
                      <Badge dot status="processing" />
                    )}
                    {item.from_user ? (
                      <Link href={`/users/${item.from_user.user_id}`}>
                        <img
                          src={item.from_user.avatar}
                          alt={item.from_user.username}
                          className="w-10 h-10 rounded-full"
                        />
                      </Link>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {NotificationTypeIcon[item.type as NotificationType]}
                      </div>
                    )}
                  </div>
                }
                title={
                  <div className="flex items-center gap-2">
                    {item.link ? (
                      <Link
                        href={item.link}
                        className="text-base font-medium hover:text-blue-600"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className="text-base font-medium">
                        {item.title}
                      </span>
                    )}
                    <Tag color="blue">
                      {NotificationTypeLabel[item.type as NotificationType]}
                    </Tag>
                  </div>
                }
                description={
                  <div className="text-gray-600 dark:text-gray-400">
                    {item.content}
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {totalCount > 20 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={20}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => t('total', { total })}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
