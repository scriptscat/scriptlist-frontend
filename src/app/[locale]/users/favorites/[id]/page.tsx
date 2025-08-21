import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
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
  const { id, locale } = await params;
  const folderId = parseInt(id);
  const t = await getTranslations({ locale, namespace: 'user.favorites' });

  try {
    // 获取收藏夹详情
    const folderDetail: FavoriteFolderItem =
      await scriptFavoriteService.getFolderDetail(folderId);

    // 获取用户信息
    const userDetail: GetUserDetailResponse = await userService.getUserDetail(
      folderDetail.user_id,
    );

    const title =
      t('folder_title', {
        folderName: folderDetail.name,
        username: userDetail.username,
      }) + ' | ScriptCat';
    const description =
      folderDetail.description ||
      t('folder_description', {
        username: userDetail.username,
        folderName: folderDetail.name,
        count: folderDetail.count,
      });

    return {
      title,
      description,
    };
  } catch (_error) {
    return {
      title: t('folder_not_found') + ' | ScriptCat',
      description: t('folder_not_found_description'),
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
    // 首先获取收藏夹详情
    const folderDetail: FavoriteFolderItem =
      await scriptFavoriteService.getFolderDetail(folderId);

    // 并行获取用户信息和脚本列表
    const [userDetail, scriptsData]: [
      GetUserDetailResponse,
      ListData<ScriptInfo>,
    ] = await Promise.all([
      userService.getUserDetail(folderDetail.user_id),
      scriptFavoriteService.getFavoriteScriptList({
        user_id: folderDetail.user_id,
        folder_id: folderId,
        page: currentPage,
        size: 20,
      }),
    ]);

    return (
      <div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              {'Loading folder...'}
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
  } catch (_error) {
    return (
      <div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              {'Loading folder...'}
            </div>
          }
        >
          <FolderDetailClient folderId={folderId} error="folder_error" />
        </Suspense>
      </div>
    );
  }
}
