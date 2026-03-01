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

export default async function ReportDetailPage({ params }: PageProps) {
  const { id, reportId } = await params;

  let report;
  try {
    report = await scriptReportService.getReportDetail(
      parseInt(id),
      parseInt(reportId),
    );
  } catch {
    notFound();
  }

  if (!report) {
    notFound();
  }

  let comments: Awaited<ReturnType<typeof scriptReportService.getCommentList>> =
    [];
  try {
    comments = await scriptReportService.getCommentList(
      parseInt(id),
      parseInt(reportId),
    );
  } catch {
    // 评论加载失败不影响页面展示
  }

  return (
    <ReportDetailClient
      report={report}
      comments={comments || []}
      scriptId={parseInt(id)}
      reportId={parseInt(reportId)}
    />
  );
}
