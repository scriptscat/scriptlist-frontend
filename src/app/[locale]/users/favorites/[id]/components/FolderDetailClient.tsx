'use client';

import { useState } from 'react';
import {
  Card,
  Tag,
  Space,
  Button,
  Empty,
  Typography,
  Breadcrumb,
  message,
  Pagination,
} from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  LeftOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  EditOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { formatNumber } from '@/lib/utils/semdate';
import { useUser } from '@/contexts/UserContext';
import ScriptCard from '@/components/Scriptlist/ScriptCard';
import FavoriteEditModal from '@/components/FavoriteEditModal';
import { scriptFavoriteService } from '@/lib/api/services/scripts/favorites';
import type { FavoriteFolderItem } from '@/lib/api/services/scripts/favorites';
import type { ScriptInfo } from '@/app/[locale]/script-show-page/[id]/types';
import type { GetUserDetailResponse } from '@/lib/api/services/user';

const { Title, Text, Paragraph } = Typography;

interface FolderDetailProps {
  folderId: number;
  folderDetail?: FavoriteFolderItem;
  userDetail?: GetUserDetailResponse;
  scripts?: ScriptInfo[];
  total?: number;
  currentPage?: number;
  error?: string;
}

export default function FolderDetailClient({
  folderId,
  folderDetail,
  userDetail,
  scripts = [],
  total = 0,
  currentPage = 1,
  error,
}: FolderDetailProps) {
  const router = useRouter();
  const { user } = useUser();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentFolder] = useState(folderDetail);
  const [loadingScripts, setLoadingScripts] = useState<Set<number>>(new Set());

  // 判断当前用户是否为收藏夹的所有者
  const isOwner =
    user && currentFolder && user.user_id === currentFolder.user_id;

  // 如果有错误或者没有收藏夹详情，显示错误页面
  if (error || !currentFolder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty
          description={error || '收藏夹不存在或已被删除'}
          className="py-16"
        >
          <Button type="primary" onClick={() => router.back()}>
            返回上一页
          </Button>
        </Empty>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    router.push(`/users/favorites/${folderId}?page=${page}`);
  };

  // 处理取消收藏脚本
  const handleUnfavorite = async (scriptId: number) => {
    if (loadingScripts.has(scriptId)) {
      return;
    }

    try {
      setLoadingScripts((prev) => new Set([...prev, scriptId]));

      await scriptFavoriteService.unfavoriteScript(folderId, {
        script_id: scriptId,
      });

      message.success('已取消收藏');
      router.refresh();
    } catch (error) {
      console.error('取消收藏失败:', error);
      message.error('取消收藏失败，请重试');
    } finally {
      setLoadingScripts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(scriptId);
        return newSet;
      });
    }
  };

  // 处理编辑收藏夹成功
  const handleEditSuccess = () => {
    setEditModalVisible(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            {
              href: '/',
              title: (
                <Space>
                  <HomeOutlined />
                  <span>首页</span>
                </Space>
              ),
            },
            ...(userDetail
              ? [
                  {
                    href: `/users/${userDetail.user_id}`,
                    title: (
                      <Space>
                        <UserOutlined />
                        <span>{userDetail.username}</span>
                      </Space>
                    ),
                  },
                ]
              : []),
            {
              href: userDetail
                ? `/users/${userDetail.user_id}/favorites`
                : undefined,
              title: (
                <Space>
                  <FolderOutlined />
                  <span>收藏夹</span>
                </Space>
              ),
            },
            {
              title: currentFolder.name,
            },
          ]}
        />
      </div>

      {/* 返回按钮 */}
      <div className="mb-4">
        <Button
          icon={<LeftOutlined />}
          onClick={() => router.back()}
          type="text"
        >
          返回
        </Button>
      </div>

      {/* 收藏夹信息卡片 */}
      <Card className="!mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Title level={2} className="!mb-0">
                {currentFolder.name}
              </Title>
              <Tag
                icon={
                  currentFolder.private === 2 ? (
                    <UnlockOutlined />
                  ) : (
                    <LockOutlined />
                  )
                }
                color={currentFolder.private === 2 ? 'green' : 'orange'}
              >
                {currentFolder.private === 2 ? '公开' : '私有'}
              </Tag>
            </div>

            {currentFolder.description && (
              <Paragraph className="text-gray-600 dark:text-gray-400 mb-3">
                {currentFolder.description}
              </Paragraph>
            )}

            <Space size="large">
              <Text type="secondary">
                脚本数量:{' '}
                <Text strong>{formatNumber(currentFolder.count)}</Text>
              </Text>
            </Space>
          </div>

          {/* 当用户为收藏夹所有者时显示编辑按钮 */}
          {isOwner && (
            <Button
              onClick={() => setEditModalVisible(true)}
              icon={<EditOutlined />}
            >
              编辑收藏夹
            </Button>
          )}
        </div>
      </Card>

      {/* 脚本列表 */}
      <div className="mb-6">
        <Title level={3} className="mb-4">
          收藏的脚本 ({total})
        </Title>

        {scripts.length > 0 ? (
          <>
            <Space direction="vertical" size="large" className="w-full">
              {scripts.map((script) => {
                const isLoading = loadingScripts.has(script.id);

                // 为收藏夹所有者添加取消收藏按钮
                const actions = isOwner
                  ? [
                      {
                        key: 'unfavorite',
                        label: isLoading ? '取消中...' : '取消收藏',
                        onClick: () => handleUnfavorite(script.id),
                        type: 'text' as const,
                        danger: true,
                        icon: <HeartFilled />,
                        tooltip: '取消收藏此脚本',
                        disabled: isLoading,
                      },
                    ]
                  : undefined;

                return (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    actions={actions}
                  />
                );
              })}
            </Space>

            {/* 分页 */}
            {total > 20 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={20}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `第 ${range[0]}-${range[1]} 项，共 ${total} 项`
                  }
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="该收藏夹暂无脚本" className="py-16" />
        )}
      </div>

      {/* 编辑收藏夹模态框 */}
      {isOwner && currentFolder && (
        <FavoriteEditModal
          visible={editModalVisible}
          folder={currentFolder}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
