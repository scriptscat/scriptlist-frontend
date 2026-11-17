import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Issue } from '@/lib/api/services/scripts/issue';
import { useSemDateTime } from '@/lib/utils/semdate';
import '@/lib/iconify-preload-issue';
import IssueLabel from './IssueLabel';
import { IssueStatusIcon } from './IssueStatus';
import { openIssueDetail } from './issueNavigation';

const MAX_LABELS = 4;

/**
 * 反馈列表的一行，GitHub Issues 式布局：
 * 状态图标 | 标题 + 内联标签 / 「#id · 作者 创建于 · 更新于」 | 回复数（0 时隐藏）。
 */
export default function IssueRow({
  scriptId,
  issue,
}: {
  scriptId: number;
  issue: Issue;
}) {
  const t = useTranslations('script.issue');
  const semDateTime = useSemDateTime();
  const href = `/script-show-page/${scriptId}/issue/${issue.id}`;
  const updated = issue.updatetime > 0 && issue.updatetime !== issue.createtime;

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={issue.title}
      className="flex cursor-pointer gap-2 border-t border-app-primary px-4 py-2 transition-colors first:border-t-0 hover:bg-[rgb(var(--bg-primary))] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(var(--border-focus))]"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a, button')) return;
        openIssueDetail(scriptId, issue.id);
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openIssueDetail(scriptId, issue.id);
        }
      }}
    >
      <IssueStatusIcon status={issue.status} className="mt-[3px]" />
      <div className="min-w-0 flex-1">
        <div className="leading-6">
          <Link
            href={href}
            target="_blank"
            className="align-middle text-[15px] font-semibold break-words !text-[rgb(var(--text-primary))] hover:!text-[rgb(var(--primary-500))] hover:underline"
          >
            {issue.title}
          </Link>
          {issue.labels.slice(0, MAX_LABELS).map((label) => (
            <IssueLabel
              key={label}
              label={label}
              className="!ms-1 !me-0 align-middle"
            />
          ))}
          {issue.labels.length > MAX_LABELS && (
            <IssueLabel
              label={'+' + (issue.labels.length - MAX_LABELS)}
              className="!ms-1 !me-0 align-middle"
            />
          )}
        </div>
        <div className="mt-0.5 text-xs text-app-secondary">
          {'#' + issue.id + ' · '}
          <Link
            href={'/users/' + issue.user_id}
            target="_blank"
            className="!text-[rgb(var(--text-secondary))] hover:!text-[rgb(var(--primary-500))] hover:underline"
          >
            {issue.username}
          </Link>{' '}
          {t('created_at', { time: semDateTime(issue.createtime) })}
          {updated &&
            ' · ' + t('updated_at', { time: semDateTime(issue.updatetime) })}
        </div>
      </div>
      {issue.comment_count > 0 && (
        <Link
          href={href}
          target="_blank"
          aria-label={t('comment_count', { count: issue.comment_count })}
          className="flex shrink-0 items-start gap-1 pt-[3px] text-xs !text-[rgb(var(--text-secondary))] hover:!text-[rgb(var(--primary-500))]"
        >
          <Icon icon="mdi:comment-outline" width={16} height={16} aria-hidden />
          {issue.comment_count}
        </Link>
      )}
    </div>
  );
}
