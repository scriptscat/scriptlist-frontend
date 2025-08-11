import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { message } from 'antd';
import { scriptFavoriteService } from '../services/scripts';
import type {
  FavoriteFolderItem,
  CreateFolderRequest,
} from '../services/scripts/favorites';
import type { APIError, ListData } from '@/types/api';

/**
 * 脚本收藏功能Hook
 * 提供收藏夹管理和脚本收藏/取消收藏功能
 */
export function useScriptFavorite(
  scriptId: number,
  initialFavoriteIds: number[] = [],
) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(initialFavoriteIds);
  const [loading, setLoading] = useState(false);

  // 获取收藏夹列表
  const {
    data: foldersData,
    error: foldersError,
    mutate: mutateFolders,
  } = useSWR<ListData<FavoriteFolderItem>, APIError>(
    ['favorite-folders'],
    () => scriptFavoriteService.getFolderList({}),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const folders = useMemo(() => foldersData?.list || [], [foldersData?.list]);

  // 收藏脚本到指定收藏夹
  const favoriteScript = useCallback(
    async (folderId: number) => {
      if (favoriteIds.includes(folderId)) {
        return; // 已经收藏
      }

      setLoading(true);
      try {
        await scriptFavoriteService.favoriteScript(folderId, {
          script_id: scriptId,
        });

        // 更新本地状态
        const newFavoriteIds = [...favoriteIds, folderId];
        setFavoriteIds(newFavoriteIds);

        // 刷新收藏夹列表（更新计数）
        mutateFolders();

        const folderName =
          folders.find((f: FavoriteFolderItem) => f.id === folderId)?.name ||
          '收藏夹';
        message.success(`已收藏到：${folderName}`);

        return newFavoriteIds;
      } catch (error) {
        console.error('收藏失败:', error);
        message.error('收藏失败，请重试');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [scriptId, favoriteIds, folders, mutateFolders],
  );

  // 取消收藏脚本
  const unfavoriteScript = useCallback(
    async (folderId: number) => {
      if (!favoriteIds.includes(folderId)) {
        return; // 未收藏
      }

      setLoading(true);
      try {
        await scriptFavoriteService.unfavoriteScript(folderId, {
          script_id: scriptId,
        });

        // 更新本地状态
        const newFavoriteIds = favoriteIds.filter((id) => id !== folderId);
        setFavoriteIds(newFavoriteIds);

        // 刷新收藏夹列表（更新计数）
        mutateFolders();

        const folderName =
          folders.find((f: FavoriteFolderItem) => f.id === folderId)?.name ||
          '收藏夹';
        message.success(`已从${folderName}移除`);

        return newFavoriteIds;
      } catch (error) {
        console.error('取消收藏失败:', error);
        message.error('取消收藏失败，请重试');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [scriptId, favoriteIds, folders, mutateFolders],
  );

  // 切换收藏状态
  const toggleFavorite = useCallback(
    async (folderId: number) => {
      if (favoriteIds.includes(folderId)) {
        return await unfavoriteScript(folderId);
      } else {
        return await favoriteScript(folderId);
      }
    },
    [favoriteIds, favoriteScript, unfavoriteScript],
  );

  // 批量更新收藏夹
  const updateFavorites = useCallback(
    async (newFolderIds: number[]) => {
      setLoading(true);
      try {
        const currentIds = new Set(favoriteIds);
        const newIds = new Set(newFolderIds);

        // 找出需要添加的收藏夹
        const toAdd = newFolderIds.filter((id) => !currentIds.has(id));
        // 找出需要移除的收藏夹
        const toRemove = favoriteIds.filter((id) => !newIds.has(id));

        // 执行批量操作
        const promises = [
          ...toAdd.map((id) =>
            scriptFavoriteService.favoriteScript(id, { script_id: scriptId }),
          ),
          ...toRemove.map((id) =>
            scriptFavoriteService.unfavoriteScript(id, { script_id: scriptId }),
          ),
        ];

        await Promise.all(promises);

        // 更新本地状态
        setFavoriteIds(newFolderIds);

        // 刷新收藏夹列表
        mutateFolders();

        if (newFolderIds.length === 0) {
          message.success('已取消收藏');
        } else {
          const folderNames = newFolderIds
            .map(
              (id) =>
                folders.find((f: FavoriteFolderItem) => f.id === id)?.name,
            )
            .filter(Boolean)
            .join('、');
          message.success(`已收藏到：${folderNames}`);
        }

        return newFolderIds;
      } catch (error) {
        console.error('批量更新收藏失败:', error);
        message.error('更新收藏失败，请重试');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [scriptId, favoriteIds, folders, mutateFolders],
  );

  // 创建新收藏夹
  const createFolder = useCallback(
    async (folderData: CreateFolderRequest) => {
      setLoading(true);
      try {
        const result = await scriptFavoriteService.createFolder(folderData);

        // 刷新收藏夹列表
        mutateFolders();

        message.success(`收藏夹"${folderData.name}"创建成功`);
        return result;
      } catch (error) {
        console.error('创建收藏夹失败:', error);
        message.error('创建收藏夹失败，请重试');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutateFolders],
  );

  // 快速收藏到默认收藏夹
  const quickFavorite = useCallback(async () => {
    const defaultFolder =
      folders.find((f: FavoriteFolderItem) => f.name === '默认收藏夹') ||
      folders[0];

    if (!defaultFolder) {
      message.error('未找到默认收藏夹');
      return;
    }

    return await toggleFavorite(defaultFolder.id);
  }, [folders, toggleFavorite]);

  return {
    // 状态
    folders,
    favoriteIds,
    loading,
    foldersError,

    // 计算属性
    isFavorited: favoriteIds.length > 0,
    favoriteCount: favoriteIds.length,

    // 操作方法
    favoriteScript,
    unfavoriteScript,
    toggleFavorite,
    updateFavorites,
    createFolder,
    quickFavorite,

    // 刷新方法
    refreshFolders: mutateFolders,
  };
}
