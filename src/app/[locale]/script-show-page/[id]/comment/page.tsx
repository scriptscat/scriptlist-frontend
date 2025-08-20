import type { Metadata, ResolvingMetadata } from 'next';
import type { ScriptDetailPageProps } from '../types';
import ScriptRatingClient from './components/ScriptRatingClient';
import { generateScriptMetadata } from '../metadata';
import { scriptService } from '@/lib/api/services/scripts';
import type { ScoreStateResponse } from '@/lib/api/services/scripts/scripts';

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

// 计算评分统计数据的辅助函数
function calculateRatingStats(
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
    const scoreNum = parseInt(score);
    if (scoreNum >= 1 && scoreNum <= 5) {
      distribution[scoreNum as keyof typeof distribution] = count;
      totalScore += scoreNum * count;
    }
  });

  const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

  return {
    averageRating,
    totalRatings,
    distribution,
  };
}

export default async function ScriptRatingPage({
  params,
}: ScriptDetailPageProps) {
  const { id } = await params;
  const scriptId = parseInt(id);

  // SSR获取评分统计数据
  const scoreState = await scriptService.getScoreState(scriptId);

  // SSR获取首页评分数据
  const initialScoreList = await scriptService.getScoreList(scriptId, {
    page: 1,
    size: 10,
    sort: 'createtime',
    order: 'desc',
  });

  // 计算评分统计数据
  const ratingStats = calculateRatingStats(scoreState);

  return (
    <ScriptRatingClient
      initialData={initialScoreList}
      initialRatingStats={ratingStats}
      scriptId={scriptId}
    />
  );
}

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'comment', locale);
}
