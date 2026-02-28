'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  List,
  Badge,
  Button,
  Tag,
  Segmented,
  Pagination,
  Empty,
  message,
  Avatar,
  Typography,
  Skeleton,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { notificationService } from '@/lib/api/services/notification';
import {
  useNotificationList,
  useUnreadCount,
} from '@/lib/api/hooks/notification';
import { useSemDateTime } from '@/lib/utils/semdate';
import Link from 'next/link';

const { Text, Paragraph } = Typography;

const PAGE_SIZE = 20;

interface NotificationsClientProps {
  initialPage: number;
  initialReadStatus?: number;
}

export default function NotificationsClient({
  initialPage,
  initialReadStatus,
}: NotificationsClientProps) {
  const t = useTranslations('notifications');
  const semDateTime = useSemDateTime();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(
    initialReadStatus,
  );

  // Use SWR hooks for data fetching
  const {
    data: notificationData,
    isLoading,
    mutate,
  } = useNotificationList({
    page: currentPage,
    size: PAGE_SIZE,
    read_status: filterStatus,
  });

  const { data: unreadData, mutate: mutateUnread } = useUnreadCount();

  const notifications = notificationData?.list ?? [];
  const totalCount = notificationData?.total ?? 0;
  const unreadCount = unreadData?.total ?? 0;

  const [batchLoading, setBatchLoading] = useState(false);

  // Sync URL without triggering navigation
  const syncURL = useCallback((page: number, readStatus?: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (readStatus !== undefined)
      params.set('read_status', readStatus.toString());
    const queryString = params.toString();
    const newURL = `/notifications${queryString ? `?${queryString}` : ''}`;
    window.history.replaceState(null, '', newURL);
  }, []);

  // 处理状态筛选变化
  const handleStatusChange = useCallback(
    (value: number | undefined) => {
      setFilterStatus(value);
      setCurrentPage(1);
      syncURL(1, value);
    },
    [syncURL],
  );

  // 标记单个通知为已读
  const handleMarkAsRead = useCallback(
    async (id: number) => {
      try {
        await notificationService.markRead(id);
        mutate();
        mutateUnread();
        message.success(t('mark_read_success'));
      } catch {
        message.error(t('mark_read_error'));
      }
    },
    [mutate, mutateUnread, t],
  );

  // 标记单个通知为未读
  const handleMarkAsUnread = useCallback(
    async (id: number) => {
      try {
        await notificationService.markRead(id, 1);
        mutate();
        mutateUnread();
        message.success(t('mark_unread_success'));
      } catch {
        message.error(t('mark_unread_error'));
      }
    },
    [mutate, mutateUnread, t],
  );

  // 全部标记为已读
  const handleMarkAllRead = useCallback(async () => {
    try {
      setBatchLoading(true);
      await notificationService.batchMarkRead({});
      mutate();
      mutateUnread();
      message.success(t('batch_mark_read_success', { count: unreadCount }));
    } catch {
      message.error(t('batch_mark_read_error'));
    } finally {
      setBatchLoading(false);
    }
  }, [mutate, mutateUnread, t, unreadCount]);

  // 页码变化
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      syncURL(page, filterStatus);
    },
    [syncURL, filterStatus],
  );

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
                loading={batchLoading}
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
          {isLoading ? (
            <div className="p-4">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : (
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
                          key="read"
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
                          key="unread"
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
                              {semDateTime(item.createtime)}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {/* 分页 */}
        {totalCount > PAGE_SIZE && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={PAGE_SIZE}
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
