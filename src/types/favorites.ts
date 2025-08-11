export interface FavoriteFolder {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  scriptsCount: number;
  subscriptionCount?: number;
  isSubscribed?: boolean;
  tags?: string[];
  coverImage?: string;
}

export interface FavoriteScript {
  id: number;
  name: string;
  description: string;
  version: string;
  author: string;
  authorId: number;
  authorAvatar: string;
  totalInstalls: number;
  todayInstalls: number;
  score: number;
  scoreNum: number;
  category: string[];
  updatetime: number;
  favoriteTime: number;
  folderId?: number; // 所属收藏夹ID，null表示默认收藏
}

export interface UserFavoritesData {
  folders: FavoriteFolder[];
  allScripts: FavoriteScript[];
  totalScripts: number;
}
