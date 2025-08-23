import type { ScoreStateResponse } from '@/lib/api/services/scripts/scripts';

/**
 * 获取评分对应的文本描述
 * @param rating 评分数值
 * @param t 翻译函数
 * @returns 评分描述文本
 */
export function getRatingText(
  rating: number,
  t: (key: string) => string,
): string {
  switch (rating) {
    case 5:
      return t('excellent');
    case 4:
      return t('good');
    case 3:
      return t('average');
    case 2:
      return t('fair');
    case 1:
      return t('poor');
    default:
      return '';
  }
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

// 计算评分统计数据的辅助函数
export function calculateRatingStats(
  scoreState: ScoreStateResponse | null,
): RatingStats {
  if (!scoreState) {
    return {
      averageRating: 0,
      totalRatings: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalScore = 0;
  const totalRatings = scoreState.score_user_count;

  // 填充分布数据
  Object.entries(scoreState.score_group).forEach(([score, count]) => {
    const scoreNum = parseInt(score) / 10;
    if (scoreNum >= 1 && scoreNum <= 5) {
      distribution[scoreNum as keyof typeof distribution] = count;
      totalScore += scoreNum * count;
    }
  });

  const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

  return {
    averageRating: parseFloat(averageRating.toFixed(1)), // 保留一位小数
    totalRatings,
    distribution,
  };
}
