import { announcementService } from '@/lib/api/services/announcement';
import type { Announcement } from '@/lib/api/services/announcement';
import HomeClient from './components/HomeClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  let announcements: Announcement[] = [];
  try {
    const data = await announcementService.getList({
      page: 1,
      size: 5,
      locale,
    });
    announcements = data.list || [];
  } catch {
    // 获取公告失败不影响页面渲染
  }

  return <HomeClient announcements={announcements} />;
}
