'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Card, Tabs } from 'antd';
import { Icon } from '@iconify/react';
import { useLocale, useTranslations } from 'next-intl';
import MarkdownViewLoading from '@/components/MarkdownView/MarkdownViewLoading';
import type {
  ScoreListItem,
  VersionListResponse,
  VersionStatResponse,
} from '@/lib/api/services/scripts/scripts';
import type { ListData } from '@/types/api';
import type { RatingStats } from '../comment/components/rating';
import { useScript } from './ScriptContext';
import { selectLocalizedSummary } from '../localizedSummary';
import ScriptMetadataExplainer from './ScriptMetadataExplainer';

const MarkdownView = dynamic(() => import('@/components/MarkdownView'), {
  loading: () => <MarkdownViewLoading height={360} />,
});
const LazyScriptVersionsClient = dynamic(
  () => import('../version/components/ScriptVersionsClient'),
  { loading: () => <MarkdownViewLoading height={360} /> },
);
const LazyScriptRatingClient = dynamic(
  () => import('../comment/components/ScriptRatingClient'),
  { loading: () => <MarkdownViewLoading height={360} /> },
);

function CountChip({ value }: { value?: number }) {
  if (value === undefined) return null;
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
      {value}
    </span>
  );
}

function AISummary({
  summary,
}: {
  summary: NonNullable<ReturnType<typeof useScript>['script']['summary']>;
}) {
  const t = useTranslations('script.detail');
  const locale = useLocale();
  const [expanded, setExpanded] = useState(true);
  const text = selectLocalizedSummary(summary, locale) || '';
  if (!text.trim()) return null;
  return (
    <div className="mb-4 rounded-md border-l-[3px] border-indigo-500 bg-indigo-50 px-3.5 py-2.5 dark:border-indigo-400 dark:bg-indigo-950/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5"
        aria-expanded={expanded}
      >
        <Icon
          icon="mdi:auto-awesome"
          className="flex-shrink-0 text-base text-indigo-600 dark:text-indigo-400"
        />
        <span className="text-xs font-semibold tracking-wide text-indigo-700 dark:text-indigo-300">
          {t('summary.label')}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={`ml-auto flex-shrink-0 text-base text-indigo-400 transition-transform dark:text-indigo-500 ${
            expanded ? '' : '-rotate-90'
          }`}
        />
      </button>
      {expanded && (
        <div className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {text}
        </div>
      )}
    </div>
  );
}

interface ScriptDetailTabsProps {
  content: string;
  contentBaseUrl?: string;
  contentRootUrl?: string;
  initialVersionData: VersionListResponse | null;
  versionStat: VersionStatResponse | null;
  versionError?: string;
  initialScoreList: ListData<ScoreListItem> | null;
  initialRatingStats: RatingStats;
}

export default function ScriptDetailTabs({
  content,
  contentBaseUrl,
  contentRootUrl,
  initialVersionData,
  versionStat,
  versionError,
  initialScoreList,
  initialRatingStats,
}: ScriptDetailTabsProps) {
  const { script } = useScript();
  const t = useTranslations('script.detail');
  const [activeKey, setActiveKey] = useState('description');
  const [versionTotal, setVersionTotal] = useState<number | undefined>(
    initialVersionData?.total,
  );

  const detailTabs = useMemo(
    () => [
      {
        key: 'description',
        label: t('tabs.description'),
        children: (
          <div>
            {script.summary && <AISummary summary={script.summary} />}
            <div className="prose prose-sm max-w-3xl dark:prose-invert">
              <MarkdownView
                id="readme"
                content={content}
                resourceBaseUrl={contentBaseUrl}
                resourceRootUrl={contentRootUrl}
              />
            </div>
          </div>
        ),
      },
      {
        key: 'versions',
        label: (
          <span className="inline-flex items-center">
            {t('tabs.versions')}
            <CountChip value={versionTotal} />
          </span>
        ),
        children:
          activeKey === 'versions' ? (
            <LazyScriptVersionsClient
              initialVersionData={initialVersionData}
              versionStat={versionStat}
              initialPage={1}
              initialPageSize={10}
              embedded
              initialError={versionError}
              onTotalChange={setVersionTotal}
            />
          ) : null,
      },
      {
        key: 'ratings',
        label: (
          <span className="inline-flex items-center">
            {t('tabs.ratings')}
            <CountChip value={initialRatingStats.totalRatings} />
          </span>
        ),
        children:
          activeKey === 'ratings' ? (
            <LazyScriptRatingClient
              initialData={initialScoreList}
              initialRatingStats={initialRatingStats}
              scriptId={script.id}
              embedded
            />
          ) : null,
      },
      {
        key: 'metadata',
        label: t('tabs.metadata'),
        children: <ScriptMetadataExplainer meta={script.script.meta_json} />,
      },
    ],
    [
      activeKey,
      content,
      contentBaseUrl,
      contentRootUrl,
      initialRatingStats,
      initialScoreList,
      initialVersionData,
      script.id,
      script.script.meta_json,
      script.summary,
      t,
      versionError,
      versionStat,
      versionTotal,
    ],
  );

  return (
    <Card className="shadow-sm" classNames={{ body: '!p-0' }}>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        destroyOnHidden
        items={detailTabs}
        size="middle"
        classNames={{
          header: '!mb-0 !px-4 sm:!px-6',
          content: '!px-4 !py-5 sm:!px-6 sm:!pb-6',
        }}
      />
    </Card>
  );
}
