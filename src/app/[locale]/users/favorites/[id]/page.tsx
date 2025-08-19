import { Suspense } from 'react';
import type { Metadata } from 'next';
import FolderDetailClient from './components/FolderDetailClient';
import { scriptFavoriteService } from '@/lib/api/services/scripts';
import { userService } from '@/lib/api/services/user';
import type { FavoriteFolderItem } from '@/lib/api/services/scripts/favorites';
import type { ScriptInfo } from '@/app/[locale]/script-show-page/[id]/types';
import type { GetUserDetailResponse } from '@/lib/api/services/user';
import type { ListData } from '@/types/api';

interface FolderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: FolderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const folderId = parseInt(id);

  try {
    const folderDetail: FavoriteFolderItem =
      await scriptFavoriteService.getFolderDetail(folderId);

    const userDetail: GetUserDetailResponse = await userService.getUserDetail(
      folderDetail.user_id,
    );

    const title =
      `${folderDetail.name} - ${userDetail.username}的收藏夹` + ' | ScriptCat';
    const description =
      folderDetail.description ||
      `${userDetail.username}的收藏夹"${folderDetail.name}"，共收录${folderDetail.count}个脚本`;

    return {
      title,
      description,
    };
  } catch (error) {
    return {
      title: '收藏夹不存在' + ' | ScriptCat',
      description: '您访问的收藏夹不存在或已被删除',
    };
  }
}

export default async function FolderDetailPage({
  params,
  searchParams,
}: FolderDetailPageProps) {
  const { id } = await params;
  const { page = '1' } = await searchParams;
  const folderId = parseInt(id);
  const currentPage = parseInt(page);

  try {
    // 获取收藏夹详情
    const folderDetail: FavoriteFolderItem =
      await scriptFavoriteService.getFolderDetail(folderId);

    // 获取用户信息
    const userDetail: GetUserDetailResponse = await userService.getUserDetail(
      folderDetail.user_id,
    );

    // 获取收藏夹中的脚本列表
    const scriptsData: ListData<ScriptInfo> =
      await scriptFavoriteService.getFavoriteScriptList({
        folder_id: folderId,
        page: currentPage,
        size: 20,
      });

    return (
      <div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              Loading folder...
            </div>
          }
        >
          <FolderDetailClient
            folderId={folderId}
            folderDetail={folderDetail}
            userDetail={userDetail}
            scripts={scriptsData.list}
            total={scriptsData.total}
            currentPage={currentPage}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              Loading folder...
            </div>
          }
        >
          <FolderDetailClient
            folderId={folderId}
            error="收藏夹不存在或已被删除"
          />
        </Suspense>
      </div>
    );
  }
}
