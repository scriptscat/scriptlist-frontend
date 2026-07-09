// Single source of truth for ad-slot metadata.
//
// `size` is a language-neutral recommended image dimension (px) shown to the
// admin so they know what creative to prepare. `nameKey` / `positionKey` point
// at i18n entries under `admin.advertise.slots.<slot>` (human-readable name and
// where the slot renders). Keep this list in sync with the backend slot enum
// and the design doc (docs/superpowers/specs/2026-06-18-ad-slots-design.md §2).

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
] as const;

export const AD_SLOT_KEYS: readonly string[] = AD_SLOT_META.map((s) => s.key);

const AD_SLOT_BY_KEY: Record<string, AdSlotMeta> = Object.fromEntries(
  AD_SLOT_META.map((s) => [s.key, s]),
);

export function getAdSlotMeta(key: string): AdSlotMeta | undefined {
  return AD_SLOT_BY_KEY[key];
}
