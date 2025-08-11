// 统一导出脚本相关服务
export { ScriptService, scriptService } from './scripts';
export { ScriptAccessService, scriptAccessService } from './access';
export { ScriptIssueService, scriptIssueService } from './issue';
export { ScriptFavoriteService, scriptFavoriteService } from './favorites';
export type {
  Issue,
  IssueListParams,
  IssueListResponse,
  IssueStatusType,
} from './issue';
export type {
  CreateFolderRequest,
  CreateFolderResponse,
  FavoriteFolderItem,
  FavoriteFolderListRequest,
  FavoriteScriptRequest,
  UnfavoriteScriptRequest,
  FavoriteScriptListRequest,
} from './favorites';

// 重新导出，保持向后兼容
export { scriptService as default } from './scripts';
