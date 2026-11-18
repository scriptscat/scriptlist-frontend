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
      {/* 图标盒子与标题行同高（leading-6 = 24px）并居中，标题折行时仍对齐首行 */}
      <IssueStatusIcon
        status={issue.status}
        className="h-6 items-center self-start"
      />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] leading-6">
          <Link
            href={href}
            target="_blank"
            className="font-semibold break-words !text-[rgb(var(--text-primary))] hover:!text-[rgb(var(--primary-500))] hover:underline"
          >
            {issue.title}
          </Link>
          {issue.labels.slice(0, MAX_LABELS).map((label) => (
            <IssueLabel
              key={label}
              label={label}
              className="relative top-px !ms-1 !me-0 align-top"
            />
          ))}
          {issue.labels.length > MAX_LABELS && (
            <IssueLabel
              label={'+' + (issue.labels.length - MAX_LABELS)}
              className="relative top-px !ms-1 !me-0 align-top"
            />
          )}
        </div>
        <div className="mt-0.5 text-xs text-app-secondary">
          <span className="whitespace-nowrap">{'#' + issue.id}</span>
          {' · '}
          <span className="whitespace-nowrap">
            <Link
              href={'/users/' + issue.user_id}
              target="_blank"
              className="!text-[rgb(var(--text-secondary))] hover:!text-[rgb(var(--primary-500))] hover:underline"
            >
              {issue.username}
            </Link>{' '}
            {t('created_at', { time: semDateTime(issue.createtime) })}
          </span>
          {updated && (
            <>
              {' · '}
              <span className="whitespace-nowrap">
                {t('updated_at', { time: semDateTime(issue.updatetime) })}
              </span>
            </>
          )}
        </div>
      </div>
      {issue.comment_count > 0 && (
        <Link
          href={href}
          target="_blank"
          aria-label={t('comment_count', { count: issue.comment_count })}
          className="flex h-6 shrink-0 items-center gap-1 text-xs !text-[rgb(var(--text-secondary))] hover:!text-[rgb(var(--primary-500))]"
        >
          <Icon icon="mdi:comment-outline" width={16} height={16} aria-hidden />
          {issue.comment_count}
        </Link>
      )}
    </div>
  );
}
