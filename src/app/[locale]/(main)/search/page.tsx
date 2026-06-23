import { Row, Col } from 'antd';
import Sidebar from '@/components/Sidebar';
import ScriptList from '@/components/Scriptlist';
import ScriptSection from '@/components/ScriptSection';
import SearchBar from '@/components/SearchBar';
import { scriptService } from '@/lib/api/services/scripts';
import {
  slimScriptList,
  slimScriptListForSidebar,
} from '@/lib/utils/script-slim';
import type { ScriptSearchRequest } from '../script-show-page/[id]/types';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import AdSlot from '@/components/AdSlot';
import SideRails from '@/components/AdSlot/SideRails';
import { prefetchAd } from '@/lib/api/services/advertise';

interface SearchPageProps {
  searchParams: Promise<ScriptSearchRequest>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const t = await getTranslations('script.metadata');
  const resolvedSearchParams = await searchParams;

  let title = t('search.title');

  if (resolvedSearchParams.keyword) {
    title = `${resolvedSearchParams.keyword} - ${t('search.title')}`;
  }

  if (resolvedSearchParams.page && resolvedSearchParams.page > 1) {
    title = `${title} - ${t('search.page_number', { page: resolvedSearchParams.page })}`;
  }

  title += ' | ScriptCat';

  return {
    title,
  };
}

function isUnfilteredBrowse(params: ScriptSearchRequest): boolean {
  return (
    !params.keyword &&
    !params.domain &&
    !params.category &&
    !params.user_id &&
    !params.script_type &&
    !params.sort &&
    (!params.page || params.page === 1)
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('script.section');

  const locale = await getLocale();

  if (isUnfilteredBrowse(resolvedSearchParams)) {
    const [dailyPick, hot, fresh, longtail, feedBannerAd] = await Promise.all([
      scriptService.search({ size: 12, page: 1, sort: 'daily_pick' }),
      scriptService.search({ size: 12, page: 1, sort: 'today_download' }),
      scriptService.search({ size: 12, page: 1, sort: 'createtime' }),
      scriptService.search({ size: 12, page: 1, sort: 'long_tail' }),
      prefetchAd('search-feed-banner', locale),
    ]);

    return (
      <PageIntlProvider namespaces={['script', 'ads']}>
        <div className="mx-auto w-full max-w-7xl min-[1400px]:max-w-[1180px] min-[1500px]:max-w-[1240px] min-[1632px]:max-w-7xl">
          <div className="mb-4">
            <SearchBar />
          </div>
          <div className="mb-6">
            <AdSlot
              slot="search-feed-banner"
              variant="banner"
              initialData={feedBannerAd}
            />
          </div>
          <SideRails />
          <ScriptSection
            icon="mdi:sparkles"
            chipClass="bg-blue-100 dark:bg-blue-500/25"
            iconClass="text-blue-500 dark:text-blue-400"
            title={t('daily_pick.title')}
            moreHref="/search?sort=daily_pick"
            scripts={slimScriptList(dailyPick.list)}
          />
          <ScriptSection
            icon="mdi:fire"
            chipClass="bg-amber-100 dark:bg-amber-500/25"
            iconClass="text-amber-500 dark:text-amber-400"
            title={t('hot.title')}
            moreHref="/search?sort=today_download"
            scripts={slimScriptList(hot.list)}
          />
          <ScriptSection
            icon="mdi:new-box"
            chipClass="bg-emerald-100 dark:bg-emerald-500/25"
            iconClass="text-emerald-500 dark:text-emerald-400"
            title={t('new.title')}
            moreHref="/search?sort=createtime"
            scripts={slimScriptList(fresh.list)}
          />
          <ScriptSection
            icon="mdi:trending-up"
            chipClass="bg-purple-100 dark:bg-purple-500/25"
            iconClass="text-purple-500 dark:text-purple-400"
            title={t('longtail.title')}
            moreHref="/search?sort=long_tail"
            scripts={slimScriptList(longtail.list)}
          />
        </div>
      </PageIntlProvider>
    );
  }

  const apiParams: ScriptSearchRequest = {
    page: resolvedSearchParams.page ? resolvedSearchParams.page : 1,
    size: 20,
    keyword: resolvedSearchParams.keyword || undefined,
    sort: resolvedSearchParams.sort || 'today_download',
    domain: resolvedSearchParams.domain || undefined,
    category: resolvedSearchParams.category || undefined,
    script_type: resolvedSearchParams.script_type || 0,
  };

  const [scripts, recentScripts, sidebarAd] = await Promise.all([
    scriptService.search(apiParams),
    scriptService.search({
      size: 10,
      page: 1,
      sort: 'createtime',
    }),
    prefetchAd('search-sidebar', locale),
  ]);

  return (
    <PageIntlProvider namespaces={['script', 'ads']}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <ScriptList
            scripts={slimScriptList(scripts.list)}
            totalCount={scripts.total}
            initialFilters={apiParams}
            initialPage={apiParams.page || 1}
          />
        </Col>
        <Col xs={24} lg={6}>
          <Sidebar
            recentScripts={slimScriptListForSidebar(recentScripts.list)}
            adInitialData={sidebarAd}
          />
        </Col>
      </Row>
    </PageIntlProvider>
  );
}
