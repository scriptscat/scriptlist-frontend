import { Suspense } from 'react';
import UserFavorites from '@/components/UserProfile/UserFavorites';
import { scriptFavoriteService } from '@/lib/api/services/scripts';
import type { FavoriteFolderItem } from '@/lib/api/services/scripts/favorites';
import type {
  Script,
  ScriptInfo,
} from '@/app/[locale]/script-show-page/[id]/types';
import type { ListData } from '@/types/api';

interface UserFavoritesPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: string; folder_id?: string }>;
}

export default async function UserFavoritesPage({
  params,
  searchParams,
}: UserFavoritesPageProps) {
  const { id } = await params;
  const { page = '1', folder_id } = await searchParams;
  const userId = parseInt(id);
  const currentPage = parseInt(page);

  // 获取收藏夹列表
  const foldersData: ListData<FavoriteFolderItem> =
    await scriptFavoriteService.getFolderList({
      user_id: userId,
    });

  // 获取收藏夹中的脚本列表
  const scriptsData: ListData<ScriptInfo> =
    await scriptFavoriteService.getFavoriteScriptList({
      user_id: userId,
      page: currentPage,
      size: 20,
    });

  return (
    <Suspense fallback={<div>Loading favorites...</div>}>
      <UserFavorites
        userId={userId}
        folders={foldersData.list}
        scripts={scriptsData.list}
        total={scriptsData.total}
        currentPage={currentPage}
      />
    </Suspense>
  );
}
