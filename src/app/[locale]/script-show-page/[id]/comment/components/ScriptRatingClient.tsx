'use client';

import { Card, Space, message } from 'antd';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/contexts/UserContext';
import type { ScoreListItem } from '@/lib/api/services/scripts/scripts';
import { scriptService } from '@/lib/api/services/scripts/scripts';
import { useScoreList, useMyScore } from '@/lib/api/hooks/script';
import type { ListData } from '@/types/api';
import {
  RatingOverview,
  UserRatingForm,
  RatingList,
  type SortOption,
  type RatingStats,
} from './rating';
import { calculateRatingStats } from './rating/utils';

interface ScriptRatingClientProps {
  initialData: ListData<ScoreListItem> | null;
  initialRatingStats: RatingStats;
  scriptId: number;
}

export default function ScriptRatingClient({
  initialData,
  initialRatingStats,
  scriptId,
}: ScriptRatingClientProps) {
  const { user } = useUser();
  const t = useTranslations('script.rating');
  const [submitting, setSubmitting] = useState(false);

  // 排序和分页相关状态
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [allRatings, setAllRatings] = useState<ScoreListItem[]>([]);
  const [ratingStats, setRatingStats] =
    useState<RatingStats>(initialRatingStats);

  // 更新评分统计数据的辅助函数
  const updateRatingStats = useCallback(async () => {
    try {
      const scoreState = await scriptService.getScoreState(scriptId);
      if (!scoreState) return;

      const { averageRating, totalRatings, distribution } =
        calculateRatingStats(scoreState);

      setRatingStats({
        averageRating,
        totalRatings,
        distribution,
      });
    } catch (error) {
      console.error(t('error_update_stats'), error);
    }
  }, [scriptId]);

  // 构建查询参数
  const queryParams = useMemo(() => {
    const sortMap: Record<SortOption, { sort: string; order: 'asc' | 'desc' }> =
      {
        newest: { sort: 'createtime', order: 'desc' },
        oldest: { sort: 'createtime', order: 'asc' },
        rating_high: { sort: 'score', order: 'desc' },
        rating_low: { sort: 'score', order: 'asc' },
        helpful: { sort: 'createtime', order: 'desc' }, // 暂时用创建时间排序
      };

    return {
      page: currentPage,
      size: pageSize,
      ...sortMap[sortBy],
    };
  }, [currentPage, pageSize, sortBy]);

  // 使用hook获取评分数据
  const {
    data: scoreListData,
    error,
    mutate,
    isLoading,
  } = useScoreList(
    scriptId,
    queryParams,
    currentPage === 1 ? initialData : undefined,
  );

  // 获取用户的评分数据
  const { data: myScore, mutate: mutateMyScore } = useMyScore(scriptId, !!user);

  // 处理数据更新
  useEffect(() => {
    if (scoreListData?.list) {
      if (currentPage === 1) {
        setAllRatings([...scoreListData.list]);
      } else {
        setAllRatings((prev) => [...prev, ...scoreListData.list]);
      }
    }
  }, [scoreListData, currentPage]);

  // 计算是否还有更多数据
  const hasMore = useMemo(() => {
    if (!scoreListData) return false;
    return allRatings.length < scoreListData.total;
  }, [scoreListData, allRatings.length]);

  // 加载更多评价
  const loadMoreRatings = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setCurrentPage((prev) => prev + 1);

    // 等待数据加载完成
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, [loading, hasMore]);

  // 无限滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreRatings();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreRatings]);

  // 排序变化时重置分页
  useEffect(() => {
    setCurrentPage(1);
    setAllRatings([]);
  }, [sortBy]);

  const handleSubmitRating = async (
    userRating: number,
    userComment: string,
  ) => {
    if (!user) {
      message.warning(t('login_required'));
      return;
    }

    setSubmitting(true);
    try {
      const { id } = await scriptService.submitScore(
        scriptId,
        userComment,
        userRating,
      );

      // 添加新评分到列表顶部
      const newRating: ScoreListItem = {
        id: id,
        user_id: user.user_id,
        username: user.username,
        avatar: user.avatar,
        message: userComment,
        author_message: '',
        createtime: Date.now(),
        updatetime: Date.now(),
        script_id: scriptId,
        score: userRating,
        author_message_createtime: 0,
      };

      setAllRatings((prev) => [newRating, ...prev]);

      // 重新获取评分状态
      await updateRatingStats();

      // 刷新数据
      mutate();
      mutateMyScore(); // 刷新用户评分数据

      message.success(t('submit_success'));
    } catch (error: any) {
      console.error(t('submit_error'), error);
      message.error(error.message || t('submit_failed'));
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRating = async (
    ratingId: number,
    userRating: number,
    userComment: string,
  ) => {
    if (!user) {
      message.warning(t('login_required'));
      return;
    }

    setSubmitting(true);
    try {
      // 使用submitScore方法来更新评分（如果已有评分，服务器会更新而不是创建新的）
      await scriptService.submitScore(scriptId, userComment, userRating);

      // 更新列表中的评分
      setAllRatings((prev) =>
        prev.map((rating) =>
          rating.id === ratingId
            ? {
                ...rating,
                score: userRating,
                rating: userRating,
                message: userComment,
                comment: userComment,
                updatetime: Date.now(),
              }
            : rating,
        ),
      );

      // 重新获取评分状态
      await updateRatingStats();

      // 刷新数据
      mutate();
      mutateMyScore(); // 刷新用户评分数据

      message.success(t('update_success'));
    } catch (error: any) {
      console.error(t('update_error'), error);
      message.error(error.message || t('update_failed'));
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMyRating = async (ratingId: number) => {
    try {
      await scriptService.deleteScore(scriptId, ratingId);

      setAllRatings((prev) => prev.filter((rating) => rating.id !== ratingId));

      // 重新获取评分状态
      await updateRatingStats();

      // 刷新数据
      mutate();
      mutateMyScore(); // 刷新用户评分数据

      message.success(t('delete_success'));
    } catch (error: any) {
      console.error(t('delete_error'), error);
      message.error(error.message || t('delete_failed'));
      throw error;
    }
  };

  const handleReply = async (ratingId: number, content: string) => {
    if (!user) {
      message.warning(t('login_required'));
      return;
    }

    try {
      await scriptService.submitCommentReply(scriptId, ratingId, content);

      setAllRatings((prev) =>
        prev.map((rating) =>
          rating.id === ratingId
            ? {
                ...rating,
                author_message: content,
                author_message_createtime: Math.floor(Date.now() / 1000),
              }
            : rating,
        ),
      );

      message.success(t('reply_success'));
    } catch (error: any) {
      console.error(t('reply_error'), error);
      message.error(error.message || t('reply_failed'));
      throw error;
    }
  };

  const handleDeleteRating = async (ratingId: number) => {
    try {
      await scriptService.deleteScore(scriptId, ratingId);

      setAllRatings((prev) => prev.filter((rating) => rating.id !== ratingId));

      // 重新获取评分状态
      await updateRatingStats();

      // 刷新数据
      mutate();

      message.success(t('delete_success'));
    } catch (error: any) {
      console.error(t('delete_error'), error);
      message.error(error.message || t('delete_failed'));
      throw error;
    }
  };

  const handleDeleteReply = async (ratingId: number) => {
    try {
      setAllRatings((prev) =>
        prev.map((rating) =>
          rating.id === ratingId
            ? {
                ...rating,
                author_message: '',
                author_message_createtime: 0,
              }
            : rating,
        ),
      );
      message.success(t('delete_success'));
    } catch (error) {
      message.error(t('delete_failed'));
      throw error;
    }
  };

  // 处理错误
  if (error) {
    console.error(t('fetch_error'), error);
  }

  return (
    <Card className="shadow-sm">
      <Space direction="vertical" className="w-full" size={16}>
        {/* 评分概览 */}
        <RatingOverview ratingStats={ratingStats} />

        {/* 用户评分表单 */}
        <UserRatingForm
          onSubmitRating={handleSubmitRating}
          submitting={submitting}
          existingRating={myScore}
          onUpdateRating={handleUpdateRating}
          onDeleteRating={handleDeleteMyRating}
        />

        {/* 用户评论列表 */}
        <RatingList
          ratings={allRatings}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onLoadMore={loadMoreRatings}
          loading={loading || isLoading}
          hasMore={hasMore}
          onReply={handleReply}
          onDeleteRating={handleDeleteRating}
          onDeleteReply={handleDeleteReply}
        />
      </Space>
    </Card>
  );
}
