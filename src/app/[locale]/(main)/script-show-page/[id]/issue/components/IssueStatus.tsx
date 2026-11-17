import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import type { IssueStatusType } from '@/lib/api/services/scripts/issue';
import '@/lib/iconify-preload-issue';

/**
 * 反馈状态的 GitHub 式表达：待解决 = 绿色圆点，已解决 = 紫色对勾。
 * 两种状态图形不同，不只靠颜色区分。
 */
const STATUS = {
  open: {
    icon: 'mdi:record-circle-outline',
    text: 'text-[rgb(var(--status-open))]',
    fill: 'bg-[rgb(var(--status-open-emphasis))]',
    label: 'status_pending',
  },
  closed: {
    icon: 'mdi:check-circle-outline',
    text: 'text-[rgb(var(--status-closed))]',
    fill: 'bg-[rgb(var(--status-closed-emphasis))]',
    label: 'status_resolved',
  },
} as const;

const styleOf = (status: IssueStatusType) =>
  status === 1 ? STATUS.open : STATUS.closed;

export function IssueStatusIcon({
  status,
  className = '',
}: {
  status: IssueStatusType;
  className?: string;
}) {
  const t = useTranslations('script.issue');
  const s = styleOf(status);
  return (
    <span
      role="img"
      aria-label={t(s.label)}
      title={t(s.label)}
      className={`inline-flex shrink-0 ${s.text} ${className}`}
    >
      <Icon icon={s.icon} width={16} height={16} aria-hidden />
    </span>
  );
}

/** 详情页标题旁的实心状态胶囊。 */
export function IssueStatusBadge({ status }: { status: IssueStatusType }) {
  const t = useTranslations('script.issue');
  const s = styleOf(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium leading-6 text-white ${s.fill}`}
    >
      <Icon icon={s.icon} width={16} height={16} aria-hidden />
      {t(s.label)}
    </span>
  );
}
