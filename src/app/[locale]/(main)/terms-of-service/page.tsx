import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/PolicyPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'policy' });
  return { title: t('terms_of_service_title') };
}

export default async function TermsOfServicePage() {
  const t = await getTranslations('policy');

  return (
    <PolicyPage
      title={t('terms_of_service_title')}
      lastUpdated={t('last_updated')}
      sectionPrefix="tos_section"
      t={t}
    />
  );
}
