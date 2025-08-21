'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Modal,
} from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  EditOutlined,
  HeartFilled,
  LinkOutlined,
} from '@ant-design/icons';
import { useRouter } from '@/i18n/routing';
import { formatNumber } from '@/lib/utils/semdate';
import { useUser } from '@/contexts/UserContext';
import ScriptCard from '@/components/Scriptlist/ScriptCard';
import FavoriteEditModal from '@/components/FavoriteEditModal';
import { scriptFavoriteService } from '@/lib/api/services/scripts/favorites';
import { getScriptManagerAPI } from '@/lib/utils/script-manager';
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
  const t = useTranslations('user.favorites');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentFolder] = useState(folderDetail);
  const [loadingScripts, setLoadingScripts] = useState<Set<number>>(new Set());
  const [modal, contextHolder] = Modal.useModal();

  // 判断当前用户是否为收藏夹的所有者
  const isOwner =
    user && currentFolder && user.user_id === currentFolder.user_id;

  // 如果有错误或者没有收藏夹详情，显示错误页面
  if (error || !currentFolder) {
    return (
      <div className="container mx-auto">
        <Empty
          description={error ? t(error) : t('folder_error')}
          className="py-16"
        >
          <Button type="primary" onClick={() => router.back()}>
            {t('go_back')}
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

      message.success(t('unfavorite_success'));
      router.refresh();
    } catch (error) {
      console.error(t('cancel_favorite_error'), error);
      message.error(t('unfavorite_failed'));
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

  // 处理订阅链接点击
  const handleSubscribeClick = () => {
    const subscribeUrl = `${window.location.origin}/scripts/subscribe/${folderId}/${encodeURIComponent(currentFolder.name)}.user.sub.js`;

    // 检查是否安装了脚本管理器
    const scriptManager = getScriptManagerAPI();

    if (!scriptManager) {
      // 没有安装脚本管理器，显示二次确认提示
      modal.confirm({
        title: t('no_script_manager_title'),
        content: t('no_script_manager_content'),
        okText: t('confirm_open'),
        cancelText: t('cancel'),
        onOk: () => {
          window.open(subscribeUrl, '_blank');
        },
      });
    } else {
      // 有脚本管理器，直接打开链接
      window.open(subscribeUrl, '_blank');
    }
  };

  return (
    <div>
      {contextHolder}
      {/* 面包屑导航 */}
      <div className="mb-3">
        <Breadcrumb
          items={[
            {
              href: '/',
              title: (
                <Space>
                  <HomeOutlined />
                  <span>{t('home')}</span>
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
                  <span>{t('favorites_breadcrumb')}</span>
                </Space>
              ),
            },
            {
              title: currentFolder.name,
            },
          ]}
        />
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
                {currentFolder.private === 2
                  ? t('status_public')
                  : t('status_private')}
              </Tag>
            </div>

            {currentFolder.description && (
              <Paragraph className="text-gray-600 dark:text-gray-400 mb-3">
                {currentFolder.description}
              </Paragraph>
            )}

            <Space size="large">
              <Text type="secondary">
                {t('script_count_text')}{' '}
                <Text strong>{formatNumber(currentFolder.count)}</Text>
              </Text>
            </Space>
          </div>

          <Space>
            {/* 当用户为收藏夹所有者时显示编辑按钮 */}
            {isOwner && (
              <Button
                onClick={() => setEditModalVisible(true)}
                icon={<EditOutlined />}
              >
                {t('edit_folder')}
              </Button>
            )}
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={handleSubscribeClick}
            >
              {t('subscription_link')}
            </Button>
          </Space>
        </div>
      </Card>

      {/* 脚本列表 */}
      <div className="mb-6">
        <Title level={3} className="mb-4">
          {t('favorite_scripts_title', { total })}
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
                        label: isLoading ? t('unfavoriting') : t('unfavorite'),
                        onClick: () => handleUnfavorite(script.id),
                        type: 'text' as const,
                        danger: true,
                        icon: <HeartFilled />,
                        tooltip: t('unfavorite_tooltip'),
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
                    t('pagination_items', {
                      start: range[0],
                      end: range[1],
                      total,
                    })
                  }
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description={t('no_scripts_in_folder')} className="py-16" />
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
