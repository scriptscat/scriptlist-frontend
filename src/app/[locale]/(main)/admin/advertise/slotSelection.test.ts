import { describe, expect, it } from 'vitest';
import { AD_SLOT_KEYS } from '@/components/AdSlot/slots';
import {
  crossSlotAggregateCount,
  describeSlotSelection,
  groupSlotOptions,
  parseSlotKeys,
} from './slotSelection';

/**
 * 广告位改为多选后，表单要靠这份摘要驱动两块提示：
 * 按形态分组列出推荐尺寸的信息条，以及跨形态时的警告条。
 * 判定抽成纯函数，才能不拉起 antd Form 就把规则钉死。
 */
describe('describeSlotSelection', () => {
  it('没选广告位时数量为 0 且不算跨形态', () => {
    const got = describeSlotSelection([]);
    expect(got.count).toBe(0);
    expect(got.mixed).toBe(false);
    expect(got.groups).toEqual([]);
  });

  it('单个广告位归为一组，带上该形态的推荐尺寸', () => {
    const got = describeSlotSelection(['home-banner']);
    expect(got.count).toBe(1);
    expect(got.mixed).toBe(false);
    expect(got.groups).toEqual([
      { variant: 'banner', size: '970×90', keys: ['home-banner'] },
    ]);
  });

  it('同形态多选不触发跨形态警告，并合并进同一组', () => {
    const got = describeSlotSelection([
      'search-rail-left',
      'search-rail-right',
    ]);
    expect(got.count).toBe(2);
    expect(got.mixed).toBe(false);
    expect(got.groups).toHaveLength(1);
    expect(got.groups[0].variant).toBe('rail');
    expect(got.groups[0].keys).toEqual([
      'search-rail-left',
      'search-rail-right',
    ]);
  });

  it('跨形态多选触发警告，并按形态分组', () => {
    const got = describeSlotSelection([
      'search-rail-left',
      'home-banner',
      'search-sidebar',
    ]);
    expect(got.count).toBe(3);
    expect(got.mixed).toBe(true);
    expect(got.groups.map((g) => g.variant)).toEqual([
      'rail',
      'banner',
      'card',
    ]);
  });

  it('分组顺序跟随首次出现的形态，不是固定表顺序', () => {
    const got = describeSlotSelection(['home-banner', 'search-rail-left']);
    expect(got.groups.map((g) => g.variant)).toEqual(['banner', 'rail']);
  });

  it('重复选择同一个广告位只计一次', () => {
    const got = describeSlotSelection(['home-banner', 'home-banner']);
    expect(got.count).toBe(1);
    expect(got.groups[0].keys).toEqual(['home-banner']);
  });

  it('未知广告位单独列出，不参与形态分组也不触发跨形态', () => {
    const got = describeSlotSelection(['home-banner', 'not-a-slot']);
    expect(got.unknown).toEqual(['not-a-slot']);
    expect(got.mixed).toBe(false);
    expect(got.groups).toHaveLength(1);
    expect(got.count).toBe(2);
  });
});

/**
 * 列表页拿到的是落库形态（逗号分隔字符串），解析规则要和后端 ParseSlotKeys 一致：
 * 去掉每项两端空白、丢弃空项。
 */
describe('parseSlotKeys', () => {
  it('空字符串解析成空列表', () => {
    expect(parseSlotKeys('')).toEqual([]);
    expect(parseSlotKeys(',,')).toEqual([]);
  });

  it('逗号分隔的多值按顺序解析，并去掉两端空白', () => {
    expect(parseSlotKeys(' home-banner , search-rail-left ')).toEqual([
      'home-banner',
      'search-rail-left',
    ]);
  });

  // 后端 ParseSlotKeys 会去重并保留首次出现的位置；两边不一致时，重复值会一路
  // 漏到列表页的 Tag 列表（React 重复 key）和编辑表单的多选框里。
  it('重复项去重且保留首次出现的位置，与后端 ParseSlotKeys 一致', () => {
    expect(parseSlotKeys('home-banner,search-rail-left,home-banner')).toEqual([
      'home-banner',
      'search-rail-left',
    ]);
  });
});

/**
 * 后台下拉按形态分组。分组顺序是展示偏好，但「每个广告位都必须能被选到」是硬约束：
 * 漏掉一种形态会让那些位在后台彻底无法投放，而且不会有任何报错。
 */
describe('groupSlotOptions', () => {
  it('按竖栏 / 横幅 / 卡片的偏好顺序分组', () => {
    expect(groupSlotOptions().map((g) => g.variant)).toEqual([
      'rail',
      'banner',
      'card',
    ]);
  });

  it('覆盖全部广告位，没有任何一个位在后台被漏掉', () => {
    const listed = groupSlotOptions().flatMap((g) => g.keys);
    expect(listed.sort()).toEqual([...AD_SLOT_KEYS].sort());
  });

  it('每组带上该形态的推荐尺寸', () => {
    const rail = groupSlotOptions().find((g) => g.variant === 'rail');
    expect(rail?.size).toBe('160×600');
  });
});

/**
 * 曝光 / 点击 / CTR 只按 ad_id 累计（spec 决策 1），一条广告投在多个位时列表里的
 * 数字是跨位合计。管理端必须能看出这是合计而非单位数据，所以要把「几个位的合计」
 * 判定钉死在纯函数上。
 */
describe('crossSlotAggregateCount', () => {
  it('单个广告位不需要点明合计', () => {
    expect(crossSlotAggregateCount('home-banner')).toBe(0);
  });

  it('没有广告位时不需要点明合计', () => {
    expect(crossSlotAggregateCount('')).toBe(0);
  });

  it('投在多个位时返回去重后的位数', () => {
    expect(crossSlotAggregateCount('home-banner,search-rail-left')).toBe(2);
    expect(
      crossSlotAggregateCount('home-banner, search-rail-left ,not-a-slot'),
    ).toBe(3);
  });

  it('重复的同一个位仍算单位，不点明合计', () => {
    expect(crossSlotAggregateCount('home-banner,home-banner')).toBe(0);
  });
});
