import { notFound } from 'next/navigation';
import { scriptIssueService } from '@/lib/api/services/scripts/issue';
import IssueCommentClient from './components/IssueCommentClient';
import { scriptService } from '@/lib/api/services/scripts';
import type { Metadata } from 'next';
import { ScriptUtils } from '../../utils';
import { getTranslations } from 'next-intl/server';

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
      scriptIssueService.getIssueDetail(parseInt(id), parseInt(issueId)),
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

  // 服务端获取 Issue 详情
  const issue = await scriptIssueService.getIssueDetail(
    parseInt(id),
    parseInt(issueId),
  );

  if (!issue) {
    notFound();
  }

  // 服务端获取评论列表
  const comments = await scriptIssueService.getIssueCommentList(
    parseInt(id),
    parseInt(issueId),
  );

  return (
    <IssueCommentClient
      issue={issue}
      comments={comments || []}
      scriptId={parseInt(id)}
      issueId={parseInt(issueId)}
    />
  );
}
