import { notFound } from 'next/navigation';
import { scriptReportService } from '@/lib/api/services/scripts/report';
import ReportDetailClient from './components/ReportDetailClient';
import { scriptService } from '@/lib/api/services/scripts';
import type { Metadata } from 'next';
import { ScriptUtils } from '../../utils';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ id: string; reportId: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations('script.report');

  try {
    const script = await scriptService.infoCached(id);
    if (!script) {
      return { title: t('page_not_found') };
    }

    const scriptName = ScriptUtils.i18nName(script, locale);
    const title = t('detail_title', { scriptName });

    return {
      title: title + ' | ScriptCat',
      description: t('detail_description', { scriptName }),
      openGraph: {
        title,
        type: 'website',
      },
    };
  } catch {
    return { title: t('report') };
  }
}

type ReportComment = NonNullable<
  Awaited<ReturnType<typeof scriptReportService.getCommentList>>
>[number];

/**
 * 评论加载失败不影响页面展示，但必须把「失败」和「没有评论」区分开——
 * 一律吞成 `[]` 的话，页面会理直气壮地写着「暂无评论」。
 */
async function loadComments(
  scriptId: number,
  reportId: number,
): Promise<{ failed: boolean; comments: ReportComment[] }> {
  try {
    const comments = await scriptReportService.getCommentList(
      scriptId,
      reportId,
    );
    return { failed: false, comments: comments ?? [] };
  } catch {
    return { failed: true, comments: [] };
  }
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id, reportId } = await params;
  const scriptId = parseInt(id);
  const numericReportId = parseInt(reportId);

  // 举报详情与评论互不依赖，串行 await 等于把两次 RTT 叠在首屏上
  const [report, commentsResult] = await Promise.all([
    scriptReportService
      .getReportDetail(scriptId, numericReportId)
      .catch(() => null),
    loadComments(scriptId, numericReportId),
  ]);

  if (!report) {
    notFound();
  }

  return (
    <ReportDetailClient
      report={report}
      comments={commentsResult.comments}
      commentsFailed={commentsResult.failed}
      scriptId={scriptId}
      reportId={numericReportId}
    />
  );
}
