import { cache } from 'react';
import type { ListData } from '@/types/api';
import { apiClient } from '../client';

/**
 * 广告类型。后端 ServeItem / AdminAdvertise 的 `ad_type` 字段；
 * 历史条目（该字段缺失或为空）一律按图片类型处理。
 */
export type AdType = 'image' | 'adsense';

export interface AdSlotItem {
  id: number;
  /** image = 站内图片素材；adsense = 由 Google 广告单元渲染。 */
  ad_type: AdType;
  /** AdSense 广告单元 ID（data-ad-slot），仅 adsense 类型有值。 */
  ad_unit_id: string;
  image_url_light: string;
  image_url_dark: string;
  link_url: string;
  title: string;
}

export interface AdminAdvertise {
  id: number;
  slot_key: string;
  ad_type: AdType;
  ad_unit_id: string;
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
  /** 省略或留空时后端按 image 处理（与 AdminCreateRequest 的可选 binding 一致）。 */
  ad_type?: AdType;
  /** adsense 类型必填，image 类型忽略。 */
  ad_unit_id?: string;
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

export interface AdDailyClick {
  date: string; // YYYY-MM-DD
  clicks: number;
}

export interface AdClickStats {
  daily: AdDailyClick[];
  total_clicks: number; // 区间内真实点击（非空 referer）
  empty_referer_clicks: number; // 区间内被过滤的空 referer 点击
  days: number; // 实际统计窗口天数
}

export interface AdClickItem {
  id: number;
  referer: string;
  locale: string;
  theme: string;
  ip: string;
  uid: number;
  createtime: number;
}

/** 归一化广告类型：后端历史数据可能没有该字段，按图片处理。 */
export function resolveAdType(ad: { ad_type?: string }): AdType {
  return ad.ad_type === 'adsense' ? 'adsense' : 'image';
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

  async adminList(
    page: number = 1,
    size: number = 20,
    slot?: string,
    enabled?: boolean,
    adType?: AdType,
  ) {
    return apiClient.get<ListData<AdminAdvertise>>(`${this.basePath}/admin`, {
      page,
      size,
      slot,
      enabled,
      ad_type: adType,
    });
  }

  /**
   * 全站某类型的广告条数。取后端返回的 total，而不是拉一页自己数——
   * 后端分页 size 上限是 100（超过会回落到 20），扫一页数不出真实条数。
   */
  async adminCountByType(adType: AdType): Promise<number> {
    const resp = await this.adminList(1, 1, undefined, undefined, adType);
    return resp.total;
  }

  async adminClickStats(id: number, days: number = 30) {
    return apiClient.get<AdClickStats>(
      `${this.basePath}/admin/${id}/click-stats`,
      { days },
    );
  }

  async adminClickList(id: number, page: number = 1, size: number = 20) {
    return apiClient.get<ListData<AdClickItem>>(
      `${this.basePath}/admin/${id}/clicks`,
      { page, size },
    );
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
