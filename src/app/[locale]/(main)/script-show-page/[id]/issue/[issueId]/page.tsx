import { cache } from 'react';
import { notFound } from 'next/navigation';
import { scriptIssueService } from '@/lib/api/services/scripts/issue';
import IssueCommentClient from './components/IssueCommentClient';
import { scriptService } from '@/lib/api/services/scripts';
import type { Metadata } from 'next';
import { ScriptUtils } from '../../utils';
import { getTranslations } from 'next-intl/server';

/**
 * `generateMetadata` 与页面都要 issue 详情，不去重就是同一个请求打两次。
 * 与 `scriptService.infoCached` 一样用 React `cache()` 按请求去重。
 */
const getIssueDetailCached = cache(async (scriptId: number, issueId: number) =>
  scriptIssueService.getIssueDetail(scriptId, issueId),
);

interface PageProps {
  params: Promise<{ id: string; issueId: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, issueId, locale } = await params;
  const t = await getTranslations('script.issue.detail');

  try {
    // 并行获取脚本信息和issue详情
    const [script, issue] = await Promise.all([
      scriptService.infoCached(id),
      getIssueDetailCached(parseInt(id), parseInt(issueId)),
    ]);

    if (!script || !issue) {
      return {
        title: t('page_not_found_title'),
      };
    }

    const scriptName = ScriptUtils.i18nName(script, locale);

    const title = t('issue_title_with_script', {
      title: issue.title,
      id: issue.id,
      scriptName,
    });
    const description = t('issue_description', {
      scriptName,
      title: issue.title,
    });

    return {
      title: title + ' | ScriptCat',
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
    };
  } catch {
    return {
      title: t('issue_feedback_title'),
    };
  }
}

export default async function IssueCommentPage({ params }: PageProps) {
  const { id, issueId } = await params;
  const scriptId = parseInt(id);
  const numericIssueId = parseInt(issueId);

  // 详情与评论互不依赖，串行 await 等于把两次 RTT 叠在首屏上
  const [issue, comments] = await Promise.all([
    getIssueDetailCached(scriptId, numericIssueId),
    scriptIssueService.getIssueCommentList(scriptId, numericIssueId),
  ]);

  if (!issue) {
    notFound();
  }

  return (
    <IssueCommentClient
      issue={issue}
      comments={comments || []}
      scriptId={scriptId}
      issueId={numericIssueId}
    />
  );
}
