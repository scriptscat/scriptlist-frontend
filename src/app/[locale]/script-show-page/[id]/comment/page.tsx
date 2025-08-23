import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from '../types';
import ScriptRatingClient from './components/ScriptRatingClient';
import { generateScriptMetadata } from '../metadata';
import { scriptService } from '@/lib/api/services/scripts';
import { calculateRatingStats } from './components/rating/utils';

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

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'comment', locale);
}
