import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from './types';
import { headers } from 'next/headers';
import ScriptDetailClient from './components/ScriptDetailClient';
import { generateScriptMetadata } from './metadata';
import scriptService from '@/lib/api/services/scripts';
import { prefetchAd } from '@/lib/api/services/advertise';
import { calculateRatingStats } from './comment/components/rating/utils';

export default async function ScriptDetailPage({
  params,
}: ScriptDetailPageProps) {
  const { id, locale } = await params;
  // Fetch content separately - React.cache deduplicates with layout's call
  const script = await scriptService.infoCached(id);
  const scriptId = parseInt(id, 10);

  const [
    versionListResult,
    versionStatResult,
    scoreStateResult,
    scoreListResult,
    sidebarAdResult,
    bannerAdResult,
  ] = await Promise.allSettled([
    scriptService.getVersionListCached(scriptId, { page: 1, size: 10 }),
    scriptService.getVersionStatCached(scriptId),
    scriptService.getScoreState(scriptId),
    scriptService.getScoreList(scriptId, {
      page: 1,
      size: 10,
      sort: 'createtime',
      order: 'desc',
    }),
    prefetchAd('script-detail-sidebar', locale),
    prefetchAd('script-detail-banner', locale),
  ]);

  const sidebarAd =
    sidebarAdResult.status === 'fulfilled' ? sidebarAdResult.value : undefined;
  const bannerAd =
    bannerAdResult.status === 'fulfilled' ? bannerAdResult.value : undefined;

  const initialVersionData =
    versionListResult.status === 'fulfilled' ? versionListResult.value : null;
  const versionStat =
    versionStatResult.status === 'fulfilled' ? versionStatResult.value : null;
  const initialScoreList =
    scoreListResult.status === 'fulfilled' ? scoreListResult.value : null;
  const ratingStats =
    scoreStateResult.status === 'fulfilled'
      ? calculateRatingStats(scoreStateResult.value)
      : {
          averageRating:
            script.score && script.score_num
              ? parseFloat((script.score / script.score_num / 10).toFixed(1))
              : 0,
          totalRatings: script.score_num,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
  const versionError =
    versionListResult.status === 'rejected'
      ? versionListResult.reason?.message
      : versionStatResult.status === 'rejected'
        ? versionStatResult.reason?.message
        : undefined;

  try {
    const h = await headers();
    const fwd: Record<string, string> = {};
    const xff = h.get('x-forwarded-for');
    const xri = h.get('x-real-ip');
    const ua = h.get('user-agent');
    if (xff) fwd['X-Forwarded-For'] = xff;
    if (xri) fwd['X-Real-IP'] = xri;
    if (ua) fwd['User-Agent'] = ua;
    await scriptService.recordVisit(id, fwd);
  } catch {
    // 访问统计失败不阻断详情页渲染
  }

  return (
    <ScriptDetailClient
      content={script.content}
      contentBaseUrl={script.content_base_url}
      contentRootUrl={script.content_root_url}
      initialVersionData={initialVersionData}
      versionStat={versionStat}
      versionError={versionError}
      initialScoreList={initialScoreList}
      initialRatingStats={ratingStats}
      sidebarAd={sidebarAd}
      bannerAd={bannerAd}
    />
  );
}

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'detail', locale);
}
