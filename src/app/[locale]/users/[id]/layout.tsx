import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import UserProfileLayout from '@/components/UserProfile/UserProfileLayout';
import { userService } from '@/lib/api/services/user';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const user = await userService.getUserDetailCache(parseInt(id));
  const t = await getTranslations({ locale, namespace: 'user' });

  if (!user) {
    return {
      title: t('user_not_found') + ' | ScriptCat',
    };
  }

  return {
    title: `${user.username} - ${t('user_homepage')}` + ' | ScriptCat',
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { id } = await params;
  const user = await userService.getUserDetailCache(parseInt(id));

  if (!user) {
    notFound();
  }

  return <UserProfileLayout user={user}>{children}</UserProfileLayout>;
}
