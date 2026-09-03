import UserFavorites from '@/components/UserProfile/UserFavorites';
import { scriptFavoriteService } from '@/lib/api/services/scripts';
import type { FavoriteFolderItem } from '@/lib/api/services/scripts/favorites';
import type { ScriptInfo } from '@/app/[locale]/(main)/script-show-page/[id]/types';
import type { ListData } from '@/types/api';

interface UserFavoritesPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function UserFavoritesPage({
  params,
  searchParams,
}: UserFavoritesPageProps) {
  const { id } = await params;
  const { page = '1' } = await searchParams;
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

  // 同 users/[id]/page.tsx：数据已在上面 await 完，UserFavorites 不会挂起，
  // 边界是死代码；翻页也只改 searchParams，UserFavorites 内部已有 useTransition 变暗。
  return (
    <UserFavorites
      userId={userId}
      folders={foldersData.list}
      scripts={scriptsData.list}
      total={scriptsData.total}
      currentPage={currentPage}
    />
  );
}
