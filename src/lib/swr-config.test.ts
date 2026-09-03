import { describe, expect, it } from 'vitest';
import { swrConfig, swrProviderValue } from './swr-config';

describe('swrConfig', () => {
  // 分页列表切页时 SWR 默认把 data 置回 undefined，列表会闪成空白；
  // keepPreviousData 让上一页内容留在屏幕上直到新数据到达。
  it('全局开启 keepPreviousData', () => {
    expect(swrConfig.keepPreviousData).toBe(true);
    expect(swrProviderValue.keepPreviousData).toBe(true);
  });
});
