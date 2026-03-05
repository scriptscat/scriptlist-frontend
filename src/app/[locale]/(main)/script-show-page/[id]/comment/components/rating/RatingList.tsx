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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('title_with_count', { count: ratings.length })}
        </h2>

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

      {ratings.length === 0 ? (
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
        <div className="flex flex-col space-y-4 gap-4">
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
