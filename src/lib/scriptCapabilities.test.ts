import { describe, expect, it } from 'vitest';
import { getCapabilities } from './scriptCapabilities';

describe('getCapabilities', () => {
  const meta = { grant: ['GM_cookie', 'GM_xmlhttpRequest'] };

  it('keeps Cookie blue when no Cookie risk was detected', () => {
    expect(getCapabilities(meta, false)).toEqual([
      { key: 'cookie' },
      { key: 'net' },
    ]);
  });

  it('marks only Cookie as high risk when a Cookie finding exists', () => {
    expect(getCapabilities(meta, true)).toEqual([
      { key: 'cookie', risk: 'high' },
      { key: 'net' },
    ]);
  });
});
