import { notFound } from 'next/navigation';
import UserProfileLayout from '@/components/UserProfile/UserProfileLayout';
import { userService } from '@/lib/api/services/user';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
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
