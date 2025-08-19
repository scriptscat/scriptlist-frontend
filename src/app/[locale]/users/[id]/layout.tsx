import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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
  const { id } = await params;
  const user = await userService.getUserDetail(parseInt(id));

  if (!user) {
    return {
      title: '用户不存在' + ' | ScriptCat',
    };
  }

  return {
    title: `${user.username} - 用户主页` + ' | ScriptCat',
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { id } = await params;
  const user = await userService.getUserDetail(parseInt(id));

  if (!user) {
    notFound();
  }

  return <UserProfileLayout user={user}>{children}</UserProfileLayout>;
}
