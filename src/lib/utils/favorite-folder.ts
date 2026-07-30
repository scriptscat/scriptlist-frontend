import type { FavoriteFolderItem } from '@/lib/api/services/scripts/favorites';

/** 默认收藏夹的名称/描述存的是占位符，展示时替换成当前语言的文案；作者改过就显示作者填的内容。 */
export const DEFAULT_FOLDER_NAME_PLACEHOLDER =
  '{{default_favorite_folder_name}}';
export const DEFAULT_FOLDER_DESCRIPTION_PLACEHOLDER =
  '{{default_favorite_folder_description}}';

export function isDefaultFolder(
  folder: Pick<FavoriteFolderItem, 'name'>,
): boolean {
  return folder.name === DEFAULT_FOLDER_NAME_PLACEHOLDER;
}

export function folderDisplayName(
  folder: Pick<FavoriteFolderItem, 'name'>,
  defaultName: string,
): string {
  return folder.name === DEFAULT_FOLDER_NAME_PLACEHOLDER
    ? defaultName
    : folder.name;
}

export function folderDisplayDescription(
  folder: Pick<FavoriteFolderItem, 'description'>,
  defaultDescription: string,
): string {
  return folder.description === DEFAULT_FOLDER_DESCRIPTION_PLACEHOLDER
    ? defaultDescription
    : folder.description;
}
