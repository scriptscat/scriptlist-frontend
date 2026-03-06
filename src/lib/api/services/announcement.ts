import type { ListData } from '@/types/api';
import { apiClient } from '../client';

// 公开接口返回（已提取当前语言）
export interface Announcement {
  id: number;
  title: string;
  content: string;
  level: number; // 1=普通 2=重要
  createtime: number;
}

// 管理员接口返回（完整多语言 JSON）
export interface AdminAnnouncement {
  id: number;
  title: string; // JSON string: {"zh-CN":"...", "en-US":"..."}
  content: string; // JSON string
  level: number;
  status: number;
  createtime: number;
  updatetime: number;
}

export interface AdminCreateAnnouncementRequest {
  title: string; // JSON string
  content: string; // JSON string
  level: number;
}

export interface AdminUpdateAnnouncementRequest {
  title: string;
  content: string;
  level: number;
  status: number;
}

class AnnouncementService {
  private readonly basePath = '/announcements';

  // 公开接口
  async getList(params: { page?: number; size?: number; locale: string }) {
    return apiClient.get<ListData<Announcement>>(this.basePath, params);
  }

  async getLatest(locale: string) {
    return apiClient.get<Announcement | null>(`${this.basePath}/latest`, {
      locale,
    });
  }

  // 管理员接口
  async adminGetList(page: number = 1, size: number = 20) {
    return apiClient.get<ListData<AdminAnnouncement>>('/admin/announcements', {
      page,
      size,
    });
  }

  async adminCreate(data: AdminCreateAnnouncementRequest) {
    return apiClient.post<{ id: number }>('/admin/announcements', data);
  }

  async adminUpdate(id: number, data: AdminUpdateAnnouncementRequest) {
    return apiClient.put<void>(`/admin/announcements/${id}`, data);
  }

  async adminDelete(id: number) {
    return apiClient.delete<void>(`/admin/announcements/${id}`);
  }
}

export const announcementService = new AnnouncementService();
