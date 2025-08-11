import { notFound } from 'next/navigation';
import { scriptIssueService } from '@/lib/api/services/scripts/issue';
import IssueCommentClient from './components/IssueCommentClient';

interface PageProps {
  params: Promise<{ id: string; issueId: string }>;
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
