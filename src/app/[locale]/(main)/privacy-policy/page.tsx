import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'policy' });
  return {
    title: t('privacy_policy_title') + ' | ScriptCat',
    description: t('privacy_policy_description'),
  };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('policy');

  return (
    <PolicyPage
      title={t('privacy_policy_title')}
      lastUpdated={t('last_updated')}
      sectionPrefix="pp_section"
      t={t}
    />
  );
}
