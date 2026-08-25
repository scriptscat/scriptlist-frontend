import { describe, expect, it } from 'vitest';
import { countUnservableAdsense, getAdFieldRequirements } from './adTypeRules';

describe('getAdFieldRequirements', () => {
  it.each([
    ['image', { lightImage: true, linkUrl: true, adUnitId: false }],
    ['adsense', { lightImage: false, linkUrl: false, adUnitId: true }],
  ] as const)('type=%s', (adType, expected) => {
    expect(getAdFieldRequirements(adType)).toEqual(expected);
  });
});

describe('countUnservableAdsense', () => {
  it('returns the adsense count when the publisher id is empty', () => {
    expect(countUnservableAdsense('', 3)).toBe(3);
  });

  it('treats a whitespace-only publisher id as unconfigured', () => {
    expect(countUnservableAdsense('   ', 3)).toBe(3);
  });

  it('returns 0 when the publisher id is configured, regardless of count', () => {
    expect(countUnservableAdsense('ca-pub-8009073269666226', 3)).toBe(0);
  });

  it('returns 0 when there are no adsense entries, even without a publisher id', () => {
    expect(countUnservableAdsense('', 0)).toBe(0);
  });
});
