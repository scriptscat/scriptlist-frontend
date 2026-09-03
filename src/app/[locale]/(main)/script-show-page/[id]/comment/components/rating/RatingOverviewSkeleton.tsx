import Skeleton from 'antd/es/skeleton';

/**
 * 评分概览（`RatingOverview`）的加载骨架。
 *
 * 左侧是 5xl 的平均分 + 星级 + 说明行，右侧是 5 条评分分布进度条；
 * 这里按同样的两栏网格占位，数据到达时不会把下方的评价列表整体推下去。
 *
 * 没有 `'use client'`：给 `comment/loading.tsx`（服务端）用。
 */
export interface RatingOverviewSkeletonProps {
  /** 已翻译好的无障碍文案。 */
  label?: string;
  className?: string;
}

const DISTRIBUTION_ROWS = [5, 4, 3, 2, 1];

export function RatingOverviewSkeleton({
  label,
  className = '',
}: RatingOverviewSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="rating-overview-skeleton"
      className={`rounded-xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/50 ${className}`.trim()}
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton.Input
            active
            size="large"
            style={{ width: 140, minWidth: 140, height: 48 }}
          />
          <Skeleton.Input
            active
            size="small"
            style={{ width: 160, minWidth: 160, height: 24 }}
          />
          <Skeleton.Input
            active
            size="small"
            style={{ width: 120, minWidth: 120, height: 16 }}
          />
        </div>
        <div className="space-y-3">
          {DISTRIBUTION_ROWS.map((star) => (
            <div key={star} className="flex items-center gap-3">
              <Skeleton.Input
                active
                size="small"
                style={{ width: 32, minWidth: 32, height: 12 }}
              />
              <div className="min-w-0 flex-1">
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: '100%', minWidth: 0, height: 8 }}
                />
              </div>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 24, minWidth: 24, height: 12 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RatingOverviewSkeleton;
