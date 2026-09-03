'use client';

import { Card, Empty, Select, Button, Spin } from 'antd';
import {
  ClockCircleOutlined,
  StarFilled,
  SortAscendingOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import RatingItem from './RatingItem';
import RatingListSkeleton from './RatingListSkeleton';
import type { RatingListProps, SortOption } from './types';

const { Option } = Select;

export default function RatingList({
  ratings,
  sortBy,
  onSortChange,
  onLoadMore,
  loading = false,
  hasMore = false,
  onReply,
  onDeleteRating,
  onDeleteReply,
}: RatingListProps) {
  const t = useTranslations('script.rating.list');

  // 排序选项
  const sortOptions = [
    {
      value: 'newest',
      label: t('sort_options.newest'),
      icon: <ClockCircleOutlined />,
    },
    {
      value: 'oldest',
      label: t('sort_options.oldest'),
      icon: <ClockCircleOutlined />,
    },
    {
      value: 'rating_high',
      label: t('sort_options.rating_high'),
      icon: <StarFilled />,
    },
    {
      value: 'rating_low',
      label: t('sort_options.rating_low'),
      icon: <StarFilled />,
    },
  ];

  // 屏幕上还什么都没有、同时又在取数 —— 这才是该画骨架的时刻。
  // 已经有旧数据时（翻页 / 刷新）继续显示旧列表，底部用轻量的转圈提示。
  const isFirstLoad = loading && ratings.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h2>
          {/* 首屏加载中还不知道条数，画出来就是一个会被改写的 0。 */}
          {!isFirstLoad && (
            <span
              data-testid="rating-count"
              className="font-mono text-sm tabular-nums text-gray-500"
            >
              {ratings.length}
            </span>
          )}
        </div>

        {/* 排序选择器 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('sort_label')}
          </span>
          <Select
            value={sortBy}
            onChange={(value: SortOption) => onSortChange(value)}
            className="min-w-32"
            size="small"
            suffixIcon={<SortAscendingOutlined />}
          >
            {sortOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {isFirstLoad ? (
        // 「空」和「正在加载」是两件事：加载态必须排在空态前面，
        // 否则首屏一定先闪一次「暂无评价」。高度按三条真实评价预留。
        <div className="min-h-[420px]">
          <RatingListSkeleton count={3} />
        </div>
      ) : ratings.length === 0 ? (
        <Card className="shadow-sm border-0 rounded-xl">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center py-8">
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">
                  {t('empty_title')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {t('empty_description')}
                </p>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {ratings.map((rating) => (
            <RatingItem
              key={rating.id}
              rating={rating}
              onReply={onReply}
              onDeleteRating={onDeleteRating}
              onDeleteReply={onDeleteReply}
            />
          ))}

          {/* 加载更多/加载状态 */}
          <div className="flex justify-center pt-6">
            {loading && (
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />}
                />
                <span>{t('loading')}</span>
              </div>
            )}

            {!loading && hasMore && onLoadMore && (
              <Button
                type="default"
                size="large"
                onClick={onLoadMore}
                className="px-8 rounded-lg shadow-sm border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              >
                {t('load_more')}
              </Button>
            )}

            {!loading && !hasMore && ratings.length > 0 && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                {t('all_loaded', { count: ratings.length })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
