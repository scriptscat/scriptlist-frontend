import { describe, expect, it } from 'vitest';
import { hasRailAd, railContainerProps } from './railLayout';

/**
 * 「有投放才收窄」的判定必须和竖栏渲染同源：收窄了却没广告会留下结构性空白，
 * 有广告却没收窄则竖栏根本放不下（留白 < MIN_GUTTER 时 SideRails 自己会隐藏）。
 * 这里把这条不变式钉死在一个纯函数上。
 */
describe('hasRailAd', () => {
  it('两侧都没预取到广告时为 false', () => {
    expect(hasRailAd(undefined, undefined)).toBe(false);
    expect(hasRailAd({ ad: null }, { ad: null })).toBe(false);
  });

  it('任一侧有广告即为 true', () => {
    const ad = { id: 1 } as never;
    expect(hasRailAd({ ad }, { ad: null })).toBe(true);
    expect(hasRailAd({ ad: null }, { ad })).toBe(true);
  });

  it('预取失败（undefined）按无广告处理，不阻断渲染', () => {
    const ad = { id: 1 } as never;
    expect(hasRailAd(undefined, { ad })).toBe(true);
    expect(hasRailAd(undefined, { ad: null })).toBe(false);
  });
});

describe('railContainerProps', () => {
  it('没有竖栏广告时不加定位标记，也不加收窄样式', () => {
    const got = railContainerProps(false);
    expect(got['data-rail-content']).toBeUndefined();
    expect(got.className).not.toContain('100vw');
  });

  it('有竖栏广告时同时给出定位标记与收窄样式', () => {
    const got = railContainerProps(true);
    expect(got['data-rail-content']).toBe('');
    // 每侧预留 400px（竖栏 160 + 内容间距 24 + 边缘 16，取整到 200）
    expect(got.className).toContain(
      'min-[1400px]:max-w-[min(80rem,calc(100vw_-_400px))]',
    );
  });

  it('标记与收窄样式永远同时出现或同时不出现', () => {
    for (const has of [true, false]) {
      const got = railContainerProps(has);
      const marked = got['data-rail-content'] !== undefined;
      const narrowed = got.className.includes('100vw');
      expect(marked).toBe(narrowed);
    }
  });

  it('两种情况都保留基础的居中与最大宽度', () => {
    for (const has of [true, false]) {
      const { className } = railContainerProps(has);
      expect(className).toContain('mx-auto');
      expect(className).toContain('max-w-7xl');
    }
  });
});
