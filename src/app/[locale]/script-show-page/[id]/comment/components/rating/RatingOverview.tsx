'use client';

import { Rate, Progress } from 'antd';
import { StarFilled } from '@ant-design/icons';
import type { RatingOverviewProps } from './types';

export default function RatingOverview({ ratingStats }: RatingOverviewProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-8 border border-amber-100 dark:border-amber-800/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 左侧：评分展示 */}
        <div className="text-center lg:text-left">
          <div className="flex items-baseline justify-center lg:justify-start gap-3 mb-4">
            <span className="text-5xl font-bold text-amber-600 dark:text-amber-400">
              {ratingStats.averageRating}
            </span>
            <span className="text-lg text-gray-500 dark:text-gray-400">
              / 5.0
            </span>
          </div>

          <Rate
            disabled
            value={ratingStats.averageRating}
            allowHalf
            className="text-2xl mb-3"
          />

          <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 dark:text-gray-400">
            <StarFilled className="text-amber-500" />
            <span>基于 {ratingStats.totalRatings} 条用户评价</span>
          </div>
        </div>

        {/* 右侧：评分分布 */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingStats.distribution[star] || 0;
            const percentage =
              ratingStats.totalRatings > 0
                ? Math.round((count / ratingStats.totalRatings) * 100)
                : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {star}
                  </span>
                  <StarFilled className="text-xs text-amber-500" />
                </div>
                <div className="flex-1">
                  <Progress
                    percent={percentage}
                    strokeColor={{
                      '0%': '#fbbf24',
                      '100%': '#f59e0b',
                    }}
                    trailColor="rgb(229 231 235)"
                    showInfo={false}
                    size="small"
                    className="h-2"
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
