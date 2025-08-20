import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '../globals.css';
import '@/../public/styles/antd.min.css';
import MainLayout from '@/components/layout/MainLayout';
import { LocalizedServerThemeWrapper } from '@/components/LocalizedServerThemeWrapper';
import '@ant-design/v5-patch-for-react-19';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const t = await getTranslations('home.metadata');
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  return (
    <LocalizedServerThemeWrapper locale={locale}>
      <MainLayout>{children}</MainLayout>
    </LocalizedServerThemeWrapper>
  );
}
