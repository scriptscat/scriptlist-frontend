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
import { redirect } from '@/i18n/routing';
import { domainToASCII } from 'node:url';

interface SearchPageProps {
  searchParams: Promise<ScriptSearchRequest>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const t = await getTranslations('script.metadata');
  const tType = await getTranslations('script.types');
  const resolvedSearchParams = await searchParams;

  const keyword = resolvedSearchParams.keyword?.trim();
  const rawDomain = resolvedSearchParams.domain?.trim();
  const domain = rawDomain && isValidDomain(rawDomain) ? rawDomain : undefined;
  const page = resolvedSearchParams.page;

  const typeKeyMap: Record<
    number,
    'script' | 'library' | 'background_script' | 'scheduled_script'
  > = {
    1: 'script',
    2: 'library',
    3: 'background_script',
    4: 'scheduled_script',
  };
  const typeKey = typeKeyMap[Number(resolvedSearchParams.script_type)];
  const typeLabel = typeKey ? tType(typeKey) : undefined;

  // Build the most specific noun phrase from the domain/type facets,
  // then let an explicit keyword lead it. This composes cleanly for every
  // combination (keyword / domain / type and any mix of them).
  let subject: string | undefined;
  if (domain && typeLabel) {
    subject = t('search.domain_typed_subject', { domain, type: typeLabel });
  } else if (domain) {
    subject = t('search.domain_subject', { domain });
  } else if (typeLabel) {
    subject = typeLabel;
  }

  if (keyword) {
    subject = subject ? `${keyword} - ${subject}` : keyword;
  }

  // Description follows the primary facet (keyword > domain > type).
  let description = t('search.description');
  if (keyword) {
    description = t('search.keyword_description', { keyword });
  } else if (domain) {
    description = t('search.domain_description', { domain });
  } else if (typeLabel) {
    description = t('search.type_description', { type: typeLabel });
  }

  let title = subject ? `${subject} - ${t('search.title')}` : t('search.title');

  if (page && page > 1) {
    title = `${title} - ${t('search.page_number', { page })}`;
  }

  title += ' | ScriptCat';

  return {
    title,
    description,
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

function isValidDomain(domain: string): boolean {
  const value = domain.trim().replace(/\.$/, '');

  if (
    !value ||
    value.includes('://') ||
    value.includes('/') ||
    value.includes(':') ||
    value.includes('@')
  ) {
    return false;
  }

  const asciiDomain = domainToASCII(value);

  if (!asciiDomain || asciiDomain.length > 253 || !asciiDomain.includes('.')) {
    return false;
  }

  const labels = asciiDomain.split('.');
  const topLevelDomain = labels[labels.length - 1];

  if (/^\d+$/.test(topLevelDomain)) {
    return false;
  }

  return labels.every((label) =>
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label),
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('script.section');

  const locale = await getLocale();

  if (
    resolvedSearchParams.domain &&
    !isValidDomain(resolvedSearchParams.domain)
  ) {
    redirect({ href: '/search', locale });
  }

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
        {/* ≥1400px 时内容区流式收窄（每侧给侧栏广告预留约 160px），让广告完整展示且与内容拉开距离；详见 SideRails。 */}
        <div
          data-search-content
          className="mx-auto w-full max-w-7xl min-[1400px]:max-w-[min(80rem,calc(100vw_-_320px))]"
        >
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
