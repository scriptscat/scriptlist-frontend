import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';
import '@/../public/styles/antd.min.css';
import MainLayout from '@/components/layout/MainLayout';
import { LocalizedServerThemeWrapper } from '@/components/LocalizedServerThemeWrapper';
import '@ant-design/v5-patch-for-react-19';

export const metadata: Metadata = {
  title: 'ScriptCat - 脚本管理平台',
  description: '发现和分享用户脚本',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
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
