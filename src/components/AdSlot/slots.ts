// Single source of truth for ad-slot metadata.
//
// `size` is a language-neutral recommended image dimension (px) shown to the
// admin so they know what creative to prepare. `nameKey` / `positionKey` point
// at i18n entries under `admin.advertise.slots.<slot>` (human-readable name and
// where the slot renders). Keep this list in sync with the backend slot enum
// and the design doc (docs/superpowers/specs/2026-06-18-ad-slots-design.md §2).

/**
 * rail 披露行（「广告」标签）的固定高度（px）。AdSense 的披露行排在广告单元
 * 上方而不是盖在上面（遮挡广告违反政策），所以它会实打实占掉高度；这里定死一个
 * 值，让 SideRails 能精确预留「披露行 + 160×600 广告单元」的整块高度。
 */
export const RAIL_DISCLOSURE_HEIGHT = 16;

export type AdSlotVariant = 'banner' | 'card' | 'rail';

export interface AdSlotMeta {
  /** Stable slot key persisted on the Advertise entity. */
  key: string;
  /** Render shape, also drives the recommended aspect/size. */
  variant: AdSlotVariant;
  /** Recommended creative size in px, e.g. "970×90". Language-neutral. */
  size: string;
}

export const AD_SLOT_META: readonly AdSlotMeta[] = [
  { key: 'home-banner', variant: 'banner', size: '970×90' },
  { key: 'search-feed-banner', variant: 'banner', size: '970×90' },
  { key: 'search-rail-left', variant: 'rail', size: '160×600' },
  { key: 'search-rail-right', variant: 'rail', size: '160×600' },
  { key: 'search-sidebar', variant: 'card', size: '300×250' },
  { key: 'search-results-banner', variant: 'banner', size: '970×90' },
  { key: 'script-detail-sidebar', variant: 'card', size: '300×250' },
  { key: 'script-detail-banner', variant: 'banner', size: '970×90' },
] as const;

export const AD_SLOT_KEYS: readonly string[] = AD_SLOT_META.map((s) => s.key);

const AD_SLOT_BY_KEY: Record<string, AdSlotMeta> = Object.fromEntries(
  AD_SLOT_META.map((s) => [s.key, s]),
);

export function getAdSlotMeta(key: string): AdSlotMeta | undefined {
  return AD_SLOT_BY_KEY[key];
}
