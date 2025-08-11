import type { ScoreListItem } from '@/lib/api/services/scripts/scripts';

// 排序选项类型
export type SortOption =
  | 'newest' // 最新优先
  | 'oldest' // 最早优先
  | 'rating_high' // 评分最高
  | 'rating_low' // 评分最低
  | 'helpful'; // 最有用（按回复数）

// 评分统计数据
export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>;
}

// 评分概览组件Props
export interface RatingOverviewProps {
  ratingStats: RatingStats;
}

// 用户评分表单组件Props
export interface UserRatingFormProps {
  onSubmitRating: (rating: number, comment: string) => Promise<void>;
  submitting: boolean;
  existingRating?: {
    id: number;
    score: number;
    message: string;
    createtime: number;
    updatetime: number;
  } | null;
  onUpdateRating?: (
    ratingId: number,
    rating: number,
    comment: string,
  ) => Promise<void>;
  onDeleteRating?: (ratingId: number) => Promise<void>;
}

// 评分列表组件Props
export interface RatingListProps {
  ratings: ScoreListItem[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  onReply: (ratingId: number, content: string) => Promise<void>;
  onDeleteRating: (ratingId: number) => Promise<void>;
  onDeleteReply: (ratingId: number, replyId: number) => Promise<void>;
}

// 评分项组件Props
export interface RatingItemProps {
  rating: ScoreListItem;
  onReply: (ratingId: number, content: string) => Promise<void>;
  onDeleteRating: (ratingId: number) => Promise<void>;
  onDeleteReply: (ratingId: number, replyId: number) => Promise<void>;
}

// 回复项组件Props
export interface ReplyItemProps {
  reply: {
    user_id: number;
    username: string;
    avatar: string;
    content: string;
    is_author: number;
    is_admin: number;
    createtime: number;
  };
  ratingId: number;
  onDelete: (ratingId: number, replyId: number) => Promise<void>;
}
