'use client';

import { useState } from 'react';
import type { MenuProps, DescriptionsProps } from 'antd';
import {
  Avatar,
  Card,
  Tabs,
  Tag,
  Button,
  Space,
  Typography,
  message,
  Row,
  Col,
  Badge,
  Tooltip,
  Dropdown,
  Divider,
  Descriptions,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  PlusOutlined,
  MessageOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  TeamOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  EditOutlined,
  MailOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { useUser } from '@/contexts/UserContext';
import type { GetUserDetailResponse } from '@/lib/api/services/user';
import UserEditModal from './UserEditModal';
import { useSemDateTime } from '@/lib/utils/semdate';
import { useFollowUser } from '@/lib/api/hooks/userClient';
import { useTranslations } from 'next-intl';

const { Title, Text, Paragraph } = Typography;

interface UserProfileLayoutProps {
  user: GetUserDetailResponse;
  children: React.ReactNode;
}

export default function UserProfileLayout({
  user,
  children,
}: UserProfileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser } = useUser();
  const activeTab = pathname.includes('/favorites') ? 'favorites' : 'scripts';
  const [isFollowing, setIsFollowing] = useState(user.is_follow);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const semDateTime = useSemDateTime();
  const { loading: followLoading, followUser } = useFollowUser();
  const t = useTranslations('user.profile');

  // 判断是否为当前用户自己
  const isCurrentUser = currentUser?.user_id === user.user_id;

  // 直接使用传入的用户详细数据
  const currentUserData = user;

  const tabItems = [
    {
      key: 'scripts',
      label: (
        <Link href={`/users/${user.user_id}`} style={{ color: 'unset' }}>
          <Space>
            <FileTextOutlined />
            <span>{t('my_scripts')}</span>
          </Space>
        </Link>
      ),
      path: '',
    },
    {
      key: 'favorites',
      label: (
        <Link
          href={`/users/${user.user_id}/favorites`}
          style={{ color: 'unset' }}
        >
          <Space>
            <HeartOutlined />
            <span>{t('my_favorites')}</span>
          </Space>
        </Link>
      ),
      path: '/favorites',
    },
  ];

  const handleTabChange = (key: string) => {
    const targetItem = tabItems.find((item) => item.key === key);
    if (targetItem && key !== 'activity') {
      const newPath = `/users/${user.user_id}${targetItem.path}`;
      router.push(newPath);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      message.warning(t('login_required'));
      return;
    }

    try {
      const newFollowStatus = await followUser(user.user_id, isFollowing);
      setIsFollowing(newFollowStatus);
      message.success(
        newFollowStatus ? t('follow_success') : t('unfollow_success'),
      );
    } catch (error: any) {
      console.error('关注操作失败:', error);
      message.error(error.message || t('operation_failed'));
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleEditSuccess = (_updatedUser: GetUserDetailResponse) => {
    // 在服务端渲染模式下，需要刷新页面来获取最新数据
    // 或者可以实现客户端状态更新逻辑
    window.location.reload();
    message.success(t('profile_update_success'));
  };

  const handleMessage = () => {
    message.info(t('message_feature_developing'));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success(t('link_copied'));
  };

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'report',
      label: t('report'),
      icon: <ShareAltOutlined />,
      onClick: () => {
        window.open(
          'https://bbs.tampermonkey.net.cn/forum-75-1.html',
          '_blank',
        );
      },
    },
  ];

  return (
    <>
      <Row gutter={[24, 24]}>
        {/* 左侧用户信息卡片 */}
        <Col xs={24} lg={8}>
          <Card className="shadow-lg border-0 h-fit sticky">
            {/* 用户基本信息 */}
            <div className="text-center mb-6">
              <Avatar
                size={100}
                src={currentUserData.avatar}
                icon={<UserOutlined />}
                className="shadow-lg border-4 border-white mb-4"
              />

              <div className="flex items-center justify-center gap-2 mb-3">
                <Title level={3} className="!mb-0">
                  <Link
                    href={
                      'https://bbs.tampermonkey.net.cn/?' +
                      currentUserData.user_id
                    }
                    target="_blank"
                  >
                    {currentUserData.username}
                  </Link>
                </Title>
              </div>
              {/* 用户描述 */}
              {currentUserData.description && (
                <>
                  <Paragraph className="text-gray-600 dark:text-gray-300 text-sm mb-0">
                    {currentUserData.description}
                  </Paragraph>
                </>
              )}

              <div className="flex justify-center gap-2 mb-4">
                {currentUserData.is_admin === 1 && (
                  <Tag color="gold" icon={<CrownOutlined />}>
                    {t('administrator')}
                  </Tag>
                )}
                {currentUserData.email_status === 1 && (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    {t('verified')}
                  </Tag>
                )}
              </div>

              {/* 操作按钮 */}
              <Space direction="vertical" size="middle" className="w-full mb-6">
                {isCurrentUser ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                    size="large"
                    block
                  >
                    {t('edit_profile')}
                  </Button>
                ) : (
                  <Button
                    type={isFollowing ? 'default' : 'primary'}
                    icon={
                      isFollowing ? <CheckCircleOutlined /> : <PlusOutlined />
                    }
                    onClick={handleFollow}
                    loading={followLoading}
                    size="large"
                    block
                  >
                    {isFollowing ? t('followed') : t('follow')}
                  </Button>
                )}
                {!isCurrentUser && (
                  <Space.Compact className="w-full">
                    <Button
                      icon={<MessageOutlined />}
                      onClick={handleMessage}
                      className="flex-1"
                      href={`https://bbs.tampermonkey.net.cn/home.php?mod=space&do=pm&subop=view&touid=${user.user_id}#last`}
                      target="_blank"
                    >
                      {t('private_message')}
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={handleShare} />
                    <Dropdown
                      menu={{ items: moreMenuItems }}
                      placement="bottomRight"
                    >
                      <Button icon={<MoreOutlined />} />
                    </Dropdown>
                  </Space.Compact>
                )}
              </Space>
            </div>

            <Divider />

            {/* 用户详细信息 */}
            <Descriptions
              column={1}
              size="small"
              className="mb-6"
              items={
                [
                  {
                    key: 'join_time',
                    label: (
                      <Text type="secondary">
                        <CalendarOutlined className="mr-1" />
                        {t('join_time')}
                      </Text>
                    ),
                    children: semDateTime(currentUserData.join_time),
                  },
                  ...(currentUserData.last_active
                    ? [
                        {
                          key: 'last_active',
                          label: (
                            <Text type="secondary">
                              <ClockCircleOutlined className="mr-1" />
                              {t('last_active')}
                            </Text>
                          ),
                          children: semDateTime(currentUserData.last_active),
                        },
                      ]
                    : []),
                  ...(currentUserData.email
                    ? [
                        {
                          key: 'email',
                          label: (
                            <Text type="secondary">
                              <MailOutlined className="mr-1" />
                              {t('email')}
                            </Text>
                          ),
                          children: currentUserData.email,
                        },
                      ]
                    : []),
                  ...(currentUserData.location
                    ? [
                        {
                          key: 'location',
                          label: (
                            <Text type="secondary">
                              <EnvironmentOutlined className="mr-1" />
                              {t('location')}
                            </Text>
                          ),
                          children: currentUserData.location,
                        },
                      ]
                    : []),
                  ...(currentUserData.website
                    ? [
                        {
                          key: 'website',
                          label: (
                            <Text type="secondary">
                              <LinkOutlined className="mr-1" />
                              {t('personal_website')}
                            </Text>
                          ),
                          children: (
                            <a
                              href={currentUserData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {currentUserData.website}
                            </a>
                          ),
                        },
                      ]
                    : []),
                  {
                    key: 'followers',
                    label: (
                      <Text type="secondary">
                        <TeamOutlined className="mr-1" />
                        {t('follow_section')}
                      </Text>
                    ),
                    children: t('followers_following', {
                      followers: currentUserData.followers,
                      following: currentUserData.following,
                    }),
                  },
                ] satisfies DescriptionsProps['items']
              }
            />

            {/* 成就徽章 */}
            <Divider />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrophyOutlined className="text-yellow-500" />
                <Text strong>{t('achievement_badges')}</Text>
                <Badge count={currentUserData.badge.length} color="#faad14" />
              </div>

              <div className="flex flex-wrap gap-1">
                {currentUserData.badge.slice(0, 6).map((badge, index) => (
                  <Tooltip
                    key={index}
                    title={badge.description}
                    placement="top"
                  >
                    <Tag color="blue" className="mb-1 cursor-help text-xs">
                      {'🏆'} {badge.name}
                    </Tag>
                  </Tooltip>
                ))}
                {currentUserData.badge.length > 6 && (
                  <Tag className="mb-1 text-xs">
                    {'+'}
                    {currentUserData.badge.length - 6}
                  </Tag>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* 右侧主要内容区域 */}
        <Col xs={24} lg={16}>
          <Card className="shadow-lg border-0">
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              size="large"
              items={tabItems.map((item) => ({
                key: item.key,
                label: item.label,
              }))}
            />
            <div>{children}</div>
          </Card>
        </Col>
      </Row>

      {/* 编辑个人信息模态框 */}
      <UserEditModal
        visible={editModalVisible}
        user={currentUserData}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
