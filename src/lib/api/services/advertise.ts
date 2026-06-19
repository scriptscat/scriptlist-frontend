import { cache } from 'react';
import type { ListData } from '@/types/api';
import { apiClient } from '../client';

export interface AdSlotItem {
  id: number;
  image_url_light: string;
  image_url_dark: string;
  link_url: string;
  title: string;
}

export interface AdminAdvertise {
  id: number;
  slot_key: string;
  title: string;
  languages: string; // comma-separated
  image_url_light: string;
  image_url_dark: string;
  link_url: string;
  weight: number;
  enabled: boolean;
  start_at: number;
  end_at: number;
  impressions: number;
  clicks: number;
  createtime: number;
  updatetime: number;
}

export interface AdminAdvertiseInput {
  slot_key: string;
  title: string;
  languages: string;
  image_url_light: string;
  image_url_dark: string;
  link_url: string;
  weight: number;
  enabled: boolean;
  start_at: number;
  end_at: number;
}

class AdvertiseService {
  private readonly basePath = '/advertise';

  async getAd(slot: string, lang: string) {
    return apiClient.get<{ ad: AdSlotItem | null }>(this.basePath, {
      slot,
      lang,
    });
  }

  async reportImpression(id: number, slot: string, lang: string) {
    return apiClient.post<Record<string, never>>(
      `${this.basePath}/${id}/impression`,
      {
        slot,
        lang,
      },
    );
  }

  async adminList(page: number = 1, size: number = 20, slot?: string) {
    return apiClient.get<ListData<AdminAdvertise>>(`${this.basePath}/admin`, {
      page,
      size,
      slot,
    });
  }

  async adminCreate(data: AdminAdvertiseInput) {
    return apiClient.post<{ id: number }>(`${this.basePath}/admin`, data);
  }

  async adminUpdate(id: number, data: AdminAdvertiseInput) {
    return apiClient.put<void>(`${this.basePath}/admin/${id}`, data);
  }

  async adminDelete(id: number) {
    return apiClient.delete<void>(`${this.basePath}/admin/${id}`);
  }

  getClickHref(id: number, slot: string, lang: string, theme: string) {
    const params = new URLSearchParams({
      slot,
      lang,
      theme,
    });
    return `/api/v2${this.basePath}/${id}/click?${params.toString()}`;
  }
}

export const advertiseService = new AdvertiseService();

/**
 * 服务端预取某广告位的广告，供 SSR 注入 SWR fallbackData 使用。
 * 用 React cache() 在同一次请求内对相同 (slot, lang) 去重。
 */
export const getAdCache = cache((slot: string, lang: string) =>
  advertiseService.getAd(slot, lang),
);

/**
 * SSR 安全预取：失败时返回 undefined（退化为客户端拉取），不阻断页面渲染。
 */
export async function prefetchAd(
  slot: string,
  lang: string,
): Promise<{ ad: AdSlotItem | null } | undefined> {
  try {
    return await getAdCache(slot, lang);
  } catch {
    return undefined;
  }
}
