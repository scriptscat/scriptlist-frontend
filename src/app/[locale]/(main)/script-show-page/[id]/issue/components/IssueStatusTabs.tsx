import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import '@/lib/iconify-preload-issue';

export type IssueStatusFilter = 'all' | 'pending' | 'resolved';

interface IssueStatusTabsProps {
  status: IssueStatusFilter;
  openCount: number;
  closedCount: number;
  onChange: (status: IssueStatusFilter) => void;
}

const tabClass = (active: boolean) =>
  `inline-flex items-center gap-1 whitespace-nowrap rounded border-0 bg-transparent px-0 py-0.5 sm:gap-1.5 sm:px-1 text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-[rgb(var(--border-focus))] ${
    active
      ? 'font-semibold text-app-primary'
      : 'text-app-secondary hover:text-[rgb(var(--text-primary))]'
  }`;

/** 列表框表头：GitHub 式「○ 待解决 N ✓ 已解决 M」，右侧是「全部」。 */
export default function IssueStatusTabs({
  status,
  openCount,
  closedCount,
  onChange,
}: IssueStatusTabsProps) {
  const t = useTranslations('script.issue');

  const count = (n: number) => (
    <span className="rounded-full bg-[rgb(var(--bg-tertiary))] px-1.5 text-xs font-medium leading-[18px]">
      {n}
    </span>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-app-primary bg-app-primary px-3 py-2.5 sm:gap-x-4 sm:px-4">
      <button
        type="button"
        aria-pressed={status === 'pending'}
        className={tabClass(status === 'pending')}
        onClick={() => onChange('pending')}
      >
        <Icon
          icon="mdi:record-circle-outline"
          width={16}
          height={16}
          aria-hidden
        />
        {t('filter_pending')}
        {count(openCount)}
      </button>
      <button
        type="button"
        aria-pressed={status === 'resolved'}
        className={tabClass(status === 'resolved')}
        onClick={() => onChange('resolved')}
      >
        <Icon
          icon="mdi:check-circle-outline"
          width={16}
          height={16}
          aria-hidden
        />
        {t('filter_resolved')}
        {count(closedCount)}
      </button>
      <span className="flex-1" />
      <button
        type="button"
        aria-pressed={status === 'all'}
        className={tabClass(status === 'all')}
        onClick={() => onChange('all')}
      >
        {t('filter_all')}
      </button>
    </div>
  );
}
