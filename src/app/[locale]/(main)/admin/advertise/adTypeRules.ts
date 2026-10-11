import type { AdType } from '@/lib/api/services/advertise';

/**
 * Which create/edit form fields are required for a given ad type
 * (design doc §6.2): image keeps the light image / link url required;
 * adsense drops those and requires the ad unit id instead. Title is
 * required for both types — the backend's `AdminCreateRequest`/
 * `AdminUpdateRequest` bind it with `binding:"required"` unconditionally
 * (internal/api/advertise/advertise.go) — adsense only demotes its label
 * to an admin-only remark, it doesn't relax the requirement.
 */
export interface AdFieldRequirements {
  lightImage: boolean;
  linkUrl: boolean;
  adUnitId: boolean;
}

export function getAdFieldRequirements(adType: AdType): AdFieldRequirements {
  if (adType === 'adsense') {
    return {
      lightImage: false,
      linkUrl: false,
      adUnitId: true,
    };
  }
  return {
    lightImage: true,
    linkUrl: true,
    adUnitId: false,
  };
}

/**
 * AdSense entries can't serve while the publisher id is unconfigured
 * (design doc §6.3 / §4). Returns how many entries would be affected so the
 * admin page can surface a concrete warning, or 0 when the publisher id is
 * set (nothing is blocked) or there are no AdSense entries.
 */
export function countUnservableAdsense(
  publisherId: string,
  adsenseCount: number,
): number {
  return publisherId.trim() === '' ? adsenseCount : 0;
}
