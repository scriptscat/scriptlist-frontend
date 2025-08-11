'use client';

import { useState, useEffect } from 'react';
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
  Timeline,
  Dropdown,
  MenuProps,
  Statistic,
  Progress,
  Divider,
  Descriptions,
  DescriptionsProps,
  Empty,
  Result,
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
  EyeOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  BulbOutlined,
  MoreOutlined,
  SettingOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  FireOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  GithubOutlined,
  EditOutlined,
  MailOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { useUser } from '@/contexts/UserContext';
import { GetUserDetailResponse } from '@/lib/api/services/user';
import { useFollowUser } from '@/lib/api/hooks/user';
import UserEditModal from './UserEditModal';
import { useSemDateTime } from '@/lib/utils/semdate';

const { Title, Text, Paragraph } = Typography;

interface UserProfileLayoutProps {
  user: GetUserDetailResponse;
  children: React.ReactNode;
}

export default function UserProfileLayout({
  user,
  children,
}: UserProfileLayoutProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('scripts');
  const [isFollowing, setIsFollowing] = useState(user.is_follow);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const semDateTime = useSemDateTime();
  const { loading: followLoading, followUser } = useFollowUser();

  // 判断是否为当前用户自己
  const isCurrentUser = currentUser?.user_id === user.user_id;

  // 直接使用传入的用户详细数据
  const currentUserData = user;

  // 根据当前路径设置活动标签
  useEffect(() => {
    if (pathname.includes('/favorites')) {
      setActiveTab('favorites');
    } else {
      setActiveTab('scripts');
    }
  }, [pathname]);

  const tabItems = [
    {
      key: 'scripts',
      label: (
        <Link
          href={`/users/${user.user_id}`}
          style={{ color: 'unset' }}
        >
          <Space>
            <FileTextOutlined />
            <span>我的脚本</span>
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
            <span>我的收藏</span>
          </Space>
        </Link>
      ),
      path: '/favorites',
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const targetItem = tabItems.find((item) => item.key === key);
    if (targetItem && key !== 'activity') {
      const newPath = `/users/${user.user_id}${targetItem.path}`;
      router.push(newPath);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }

    try {
      const newFollowStatus = await followUser(user.user_id, isFollowing);
      setIsFollowing(newFollowStatus);
      message.success(newFollowStatus ? '关注成功' : '已取消关注');
    } catch (error: any) {
      console.error('关注操作失败:', error);
      message.error(error.message || '操作失败，请重试');
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleEditSuccess = (updatedUser: GetUserDetailResponse) => {
    // 在服务端渲染模式下，需要刷新页面来获取最新数据
    // 或者可以实现客户端状态更新逻辑
    window.location.reload();
    message.success('个人信息更新成功！');
  };

  const handleMessage = () => {
    message.info('发送消息功能开发中...');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('链接已复制到剪贴板');
  };

  // 获取活动图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'script':
        return <CodeOutlined className="text-blue-500" />;
      case 'update':
        return <ThunderboltOutlined className="text-orange-500" />;
      case 'comment':
        return <MessageOutlined className="text-green-500" />;
      case 'favorite':
        return <HeartOutlined className="text-red-500" />;
      case 'achievement':
        return <TrophyOutlined className="text-yellow-500" />;
      default:
        return <BulbOutlined className="text-purple-500" />;
    }
  };

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'report',
      label: '举报',
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
                  {currentUserData.username}
                </Title>
                {currentUserData.is_admin === 1 && (
                  <Tag color="gold" icon={<CrownOutlined />}>
                    管理员
                  </Tag>
                )}
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
                {currentUserData.email_status === 1 && (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    已验证
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
                    编辑个人信息
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
                    {isFollowing ? '已关注' : '关注'}
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
                      私信
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
                        加入时间
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
                              最后活跃
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
                              邮箱
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
                              位置
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
                              个人网站
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
                        关注
                      </Text>
                    ),
                    children: `${currentUserData.followers} 关注者 · ${currentUserData.following} 正在关注`,
                  },
                ] satisfies DescriptionsProps['items']
              }
            />

            {/* 成就徽章 */}
            <Divider />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrophyOutlined className="text-yellow-500" />
                <Text strong>成就徽章</Text>
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
                      🏆 {badge.name}
                    </Tag>
                  </Tooltip>
                ))}
                {currentUserData.badge.length > 6 && (
                  <Tag className="mb-1 text-xs">
                    +{currentUserData.badge.length - 6}
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
