import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/PolicyPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'policy' });
  return { title: t('privacy_policy_title') };
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
