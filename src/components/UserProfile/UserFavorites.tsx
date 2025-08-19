'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Empty,
  Button,
  Typography,
  message,
  Row,
  Col,
  Divider,
  Pagination,
} from 'antd';
import {
  StarOutlined,
  FolderOutlined,
  PlusOutlined,
  UnlockOutlined,
  BookOutlined,
  HeartFilled,
  LockOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ScriptCard from '@/components/Scriptlist/ScriptCard';
import { scriptFavoriteService } from '@/lib/api/services/scripts';
import type { FavoriteFolderItem } from '@/lib/api/services/scripts/favorites';
import type { ScriptListItem } from '@/app/[locale]/script-show-page/[id]/types';

const { Title, Text } = Typography;

interface UserFavoritesProps {
  userId: number;
  folders: FavoriteFolderItem[];
  scripts: ScriptListItem[];
  total: number;
  currentPage: number;
}

export default function UserFavorites({
  folders,
  scripts,
  total,
  currentPage,
}: UserFavoritesProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingScripts, setLoadingScripts] = useState<Set<number>>(new Set());

  const handleUnfavorite = async (scriptId: number) => {
    // 避免重复操作
    if (loadingScripts.has(scriptId)) {
      return;
    }

    try {
      setLoadingScripts((prev) => new Set([...prev, scriptId]));

      // 如果指定了收藏夹ID，从该收藏夹中取消收藏
      // 如果没有指定收藏夹ID（currentFolderId为undefined），则从所有收藏夹中取消收藏（使用folderId: 0）

      await scriptFavoriteService.unfavoriteScript(0, {
        script_id: scriptId,
      });

      message.success('已取消收藏');

      // 刷新页面数据
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

  const handleCreateFolder = () => {
    message.info('创建收藏夹功能正在开发中');
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // 渲染收藏夹卡片
  const renderFolderCard = (folder: FavoriteFolderItem) => {
    return (
      <Card
        key={folder.id}
        className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full"
        hoverable
        size="small"
      >
        <Link href={`/users/favorites/${folder.id}`}>
          <div className="space-y-3">
            {/* 标题和状态 */}
            <div className="flex items-start justify-between">
              <h4 className="text-base font-medium truncate flex-1 mr-2">
                {folder.name}
              </h4>
              {folder.private === 1 ? (
                <LockOutlined className="text-sm !text-orange-500" />
              ) : (
                <UnlockOutlined className="text-sm  !text-green-500" />
              )}
            </div>

            {/* 描述 */}
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 min-h-[2.5rem]">
              {folder.description || '暂无描述'}
            </p>

            {/* 统计信息 */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <BookOutlined className="mr-1" />
                  {folder.count} 脚本
                </span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  };

  // 渲染脚本卡片
  const renderScriptCard = (script: ScriptListItem) => {
    const isLoading = loadingScripts.has(script.id);

    const actions = [
      {
        key: 'unfavorite',
        label: isLoading ? '取消中...' : '取消收藏',
        onClick: (script: ScriptListItem) => handleUnfavorite(script.id),
        type: 'text' as const,
        danger: true,
        icon: <HeartFilled />,
        tooltip: '取消收藏此脚本',
        disabled: isLoading,
      },
    ];

    return (
      <div key={script.id}>
        <ScriptCard script={script} actions={actions} />
      </div>
    );
  };

  // 如果没有收藏的脚本，显示空状态
  if (scripts.length === 0 && folders.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="text-center">
            <Text type="secondary">该用户还没有收藏任何脚本</Text>
            <div className="mt-4">
              <Link href="/search">
                <Button type="primary" icon={<StarOutlined />}>
                  去发现脚本
                </Button>
              </Link>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 收藏夹展示区域 */}
      {folders.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">
              <FolderOutlined className="mr-2" />
              我的收藏夹
            </Title>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleCreateFolder}
            >
              创建收藏夹
            </Button>
          </div>

          <Row gutter={[12, 12]}>
            {folders.map((folder) => (
              <Col key={folder.id} xs={24} sm={12} lg={8} xl={6}>
                {renderFolderCard(folder)}
              </Col>
            ))}
          </Row>

          <Divider />
        </>
      )}

      {/* 脚本列表区域 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="!mb-0">
            收藏的脚本
          </Title>
        </div>

        <div className="space-y-4">
          {scripts.length === 0 ? (
            <Empty description="该分类下暂无收藏的脚本" className="py-8" />
          ) : (
            <Row gutter={[16, 16]}>
              {scripts.map((script) => (
                <Col key={script.id} xs={24}>
                  {renderScriptCard(script)}
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* 分页 */}
        {total > 20 && (
          <div className="flex justify-center pt-6">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={20}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
