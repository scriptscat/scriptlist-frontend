import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import CodeSearchClient from './components/CodeSearchClient';
import { noindexRobots } from '@/lib/seo/robots';

interface CodeSearchPageProps {
  searchParams: Promise<{
    keyword?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: CodeSearchPageProps): Promise<Metadata> {
  const t = await getTranslations('script.code_search');
  const resolvedSearchParams = await searchParams;
  const keyword = resolvedSearchParams.keyword?.trim();

  return {
    title: keyword
      ? `${keyword} - ${t('title')} | ScriptCat`
      : `${t('title')} | ScriptCat`,
    robots: noindexRobots,
  };
}

export default async function CodeSearchPage({
  searchParams,
}: CodeSearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page || '1');

  return (
    <PageIntlProvider namespaces={['script']}>
      <CodeSearchClient
        initialKeyword={resolvedSearchParams.keyword || ''}
        initialPage={Number.isFinite(page) && page > 0 ? page : 1}
      />
    </PageIntlProvider>
  );
}
