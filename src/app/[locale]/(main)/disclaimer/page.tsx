import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/PolicyPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'policy' });
  return { title: t('disclaimer_title') };
}

export default async function DisclaimerPage() {
  const t = await getTranslations('policy');

  return (
    <PolicyPage
      title={t('disclaimer_title')}
      lastUpdated={t('last_updated')}
      sectionPrefix="dc_section"
      t={t}
    />
  );
}
