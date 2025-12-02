'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Card,
  List,
  Badge,
  Button,
  Tag,
  Space,
  Segmented,
  Select,
  Pagination,
  Empty,
  message,
  Avatar,
  Typography,
  Divider,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  CommentOutlined,
  HeartOutlined,
  UserAddOutlined,
  MailOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Notification } from '@/lib/api/services/notification';
import { notificationService } from '@/lib/api/services/notification';
import { it } from 'node:test';
import Link from 'next/link';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

interface NotificationsClientProps {
  initialNotifications: Notification[];
  totalCount: number;
  initialPage: number;
  initialReadStatus?: number;
  unreadCount: number;
}

export default function NotificationsClient({
  initialNotifications,
  totalCount,
  initialPage,
  initialReadStatus,
  unreadCount: initialUnreadCount,
}: NotificationsClientProps) {
  const t = useTranslations('notifications');
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(
    initialReadStatus,
  );

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // 处理状态筛选变化
  const handleStatusChange = (value: number | undefined) => {
    setFilterStatus(value);
    setCurrentPage(1);
    const params = new URLSearchParams();
    params.set('page', '1');
    if (value !== undefined) {
      params.set('read_status', value.toString());
    }
    router.push(`/notifications?${params.toString()}`);
  };

  // 标记单个通知为已读
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read_status: 2 } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      message.success(t('mark_read_success'));
    } catch (error) {
      message.error(t('mark_read_error'));
    }
  };

  // 标记单个通知为未读
  const handleMarkAsUnread = async (id: number) => {
    try {
      await notificationService.markRead(id, 1);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read_status: 1 } : item,
        ),
      );
      setUnreadCount((prev) => prev + 1);
      message.success(t('mark_unread_success'));
    } catch (error) {
      message.error(t('mark_unread_error'));
    }
  };

  // 全部标记为已读
  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await notificationService.batchMarkRead({});
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_status: 2 })),
      );
      setUnreadCount(0);
      message.success(t('batch_mark_read_success', { count: unreadCount }));
    } catch (error) {
      message.error(t('batch_mark_read_error'));
    } finally {
      setLoading(false);
    }
  };

  // 页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (filterStatus !== undefined) {
      params.set('read_status', filterStatus.toString());
    }
    router.push(`/notifications?${params.toString()}`);
  };

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3">
        {/* 顶部操作栏 - 统计 + 筛选器合并 */}
        <Card
          className="shadow-sm"
          size="small"
          styles={{
            body: { padding: '8px 12px' },
          }}
        >
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Text type="secondary" className="text-xs whitespace-nowrap">
                状态:
              </Text>
              <Segmented
                value={filterStatus === undefined ? 'all' : filterStatus}
                onChange={(value) => {
                  if (value === 'all') {
                    handleStatusChange(undefined);
                  } else {
                    handleStatusChange(value as number);
                  }
                }}
                size="small"
                options={[
                  { label: t('all'), value: 'all' },
                  {
                    label: t('unread'),
                    value: 1,
                  },
                  { label: t('read'), value: 2 },
                ]}
              />
            </div>
            {unreadCount > 0 && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleMarkAllRead}
                loading={loading}
                size="small"
              >
                {t('mark_all_read')}
              </Button>
            )}
          </div>
        </Card>

        {/* 通知列表 */}
        <Card
          className="shadow-sm"
          size="small"
          styles={{ body: { padding: 0 } }}
        >
          <List
            dataSource={notifications}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Text type="secondary">{t('empty')}</Text>}
                />
              ),
            }}
            renderItem={(item) => {
              const isUnread = item.read_status === 1;

              return (
                <List.Item
                  key={item.id}
                  className={`!px-3 !py-2.5 transition-all cursor-pointer ${
                    isUnread
                      ? 'border-l-4 border-l-blue-500 bg-blue-50/40 hover:bg-blue-50/60 dark:bg-blue-950/30 dark:hover:bg-blue-950/40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    if (item.link) {
                      window.open(item.link, '_blank');
                      // 如果是未读状态，点击后标记为已读
                      if (isUnread) {
                        handleMarkAsRead(item.id);
                      }
                    }
                  }}
                  actions={[
                    isUnread ? (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                        }}
                        className="h-6 px-2"
                      >
                        {t('mark_as_read')}
                      </Button>
                    ) : (
                      <Button
                        type="text"
                        size="small"
                        icon={<BellOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsUnread(item.id);
                        }}
                        className="h-6 px-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        {t('mark_as_unread')}
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      item.from_user?.user_id ? (
                        <Avatar src={item.from_user.avatar} size={32}>
                          {item.from_user.username[0]}
                        </Avatar>
                      ) : (
                        <Avatar
                          icon={<BellOutlined className="text-blue-500" />}
                          size={32}
                          className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                        />
                      )
                    }
                    title={
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.title && (
                          <Text
                            strong={isUnread}
                            className={`text-sm leading-tight ${!isUnread ? 'text-gray-500 dark:text-gray-400' : ''}`}
                          >
                            {t(item.title, item.params)}
                          </Text>
                        )}
                        {!item.from_user?.user_id && (
                          <Tag
                            color="blue"
                            className="!m-0 !py-0 !text-xs !leading-5"
                          >
                            {t('type_system')}
                          </Tag>
                        )}
                        {isUnread && (
                          <Badge
                            status="processing"
                            text={
                              <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                                未读
                              </span>
                            }
                            className="!leading-none"
                          />
                        )}
                      </div>
                    }
                    description={
                      <div className="flex items-start gap-2">
                        <Paragraph
                          className={`!mb-0 text-sm leading-relaxed flex-1 ${!isUnread ? 'text-gray-500 dark:text-gray-400' : ''}`}
                          ellipsis={{
                            rows: 2,
                            expandable: true,
                            symbol: '展开',
                          }}
                        >
                          {t.rich(item.content, {
                            ...item.params,
                            link: (chunks) => {
                              return (
                                <Link
                                  href={'#'}
                                  className="text-blue-600 dark:text-blue-400 underline"
                                >
                                  {chunks}
                                </Link>
                              );
                            },
                          })}
                        </Paragraph>
                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 flex-shrink-0">
                          <ClockCircleOutlined className="text-xs" />
                          <Text
                            type="secondary"
                            className="text-xs leading-none whitespace-nowrap"
                          >
                            {dayjs.unix(item.createtime).fromNow()}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>

        {/* 分页 */}
        {totalCount > 20 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={20}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => t('total', { total })}
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
}
