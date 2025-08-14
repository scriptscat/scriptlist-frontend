import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';
import '@/../public/styles/antd.min.css';
import MainLayout from '@/components/layout/MainLayout';
import { LocalizedServerThemeWrapper } from '@/components/LocalizedServerThemeWrapper';
import '@ant-design/v5-patch-for-react-19';

export const metadata: Metadata = {
  title: 'ScriptCat - 分享你的用户脚本',
  description: '脚本猫脚本站,在这里你可以与全世界分享你的用户脚本',
  keywords:
    'ScriptCat,UserScript,Tampermonkey,Greasemonkey,Violentmonkey,用户脚本,脚本猫,油猴,油猴脚本',
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
