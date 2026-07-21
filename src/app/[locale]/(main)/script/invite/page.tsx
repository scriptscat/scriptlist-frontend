import { redirect } from '@/i18n/routing';
export { noindexMetadata as metadata } from '@/lib/seo/robots';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacyScriptInvitePage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    if (value !== undefined) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  redirect({
    href: `/scripts/invite${queryString ? `?${queryString}` : ''}`,
    locale,
  });
}
