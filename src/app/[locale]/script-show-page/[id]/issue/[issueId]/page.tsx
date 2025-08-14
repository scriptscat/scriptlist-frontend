import { notFound } from 'next/navigation';
import { scriptIssueService } from '@/lib/api/services/scripts/issue';
import IssueCommentClient from './components/IssueCommentClient';
import { scriptService } from '@/lib/api/services/scripts';
import { ResolvingMetadata, Metadata } from 'next';
import { ScriptDetailPageProps } from '../../types';

interface PageProps {
  params: Promise<{ id: string; issueId: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id, issueId } = await params;
  
  try {
    // 并行获取脚本信息和issue详情
    const [script, issue] = await Promise.all([
      scriptService.infoCached(id),
      scriptIssueService.getIssueDetail(parseInt(id), parseInt(issueId))
    ]);

    if (!script || !issue) {
      return {
        title: '页面未找到 | 脚本猫',
      };
    }

    const title = `${issue.title} · 反馈 #${issue.id} - ${script.name}`;
    const description = `${script.name}的问题反馈：${issue.title}`;

    return {
      title: title + ' | 脚本猫',
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: '问题反馈 | 脚本猫',
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
