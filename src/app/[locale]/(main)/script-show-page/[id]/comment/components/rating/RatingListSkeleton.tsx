import {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
} from '@/components/ui/AntdSkeleton';

/**
 * 评价列表的加载骨架。
 *
 * 每行按真实评价条目排布：40px 圆形头像 + 120px 用户名条 + 五颗星 +
 * 两行评价正文（100% / 70%）。
 *
 * 存在的原因见 `RatingList`：那里的「暂无评价」分支排在 loading 之前，
 * 首屏空列表 + 正在加载时必定先闪一次「暂无评价」。加载态要先于空态判断，
 * 并且画出列表真实的形状。
 *
 * 没有 `'use client'`：`comment/loading.tsx`（服务端）与 `RatingList`（客户端）共用。
 */
export interface RatingListSkeletonProps {
  /** 行数，默认 3。 */
  count?: number;
  /** 已翻译好的无障碍文案。 */
  label?: string;
  className?: string;
}

const STARS = [0, 1, 2, 3, 4];

export function RatingListSkeleton({
  count = 3,
  label,
  className = '',
}: RatingListSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="rating-list-skeleton"
      className={`divide-y divide-gray-100 dark:divide-gray-800 ${className}`.trim()}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          data-testid="rating-list-skeleton-item"
          className="py-5 first:pt-0"
        >
          <div className="flex items-start gap-4">
            <SkeletonAvatar active shape="circle" size={40} />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <SkeletonInput
                  active
                  size="small"
                  style={{ width: 120, minWidth: 120, height: 16 }}
                />
                <div className="flex items-center gap-1">
                  {STARS.map((star) => (
                    <SkeletonButton
                      key={star}
                      active
                      size="small"
                      shape="circle"
                      style={{ width: 14, minWidth: 14, height: 14 }}
                    />
                  ))}
                </div>
              </div>
              <Skeleton
                active
                title={false}
                paragraph={{ rows: 2, width: ['100%', '70%'] }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RatingListSkeleton;
