import { describe, expect, it } from 'vitest';
import zhCN from '../../../public/locales/zh-CN/translations.json';
import { AD_SLOT_KEYS, AD_SLOT_META, getAdSlotMeta } from './slots';

const NEW_RAIL_SLOTS = [
  'search-results-rail-left',
  'search-results-rail-right',
  'script-detail-rail-left',
  'script-detail-rail-right',
] as const;

describe('广告位元数据', () => {
  it.each(NEW_RAIL_SLOTS)('%s 是 160×600 的竖栏位', (key) => {
    const meta = getAdSlotMeta(key);
    expect(meta).toBeDefined();
    expect(meta?.variant).toBe('rail');
    expect(meta?.size).toBe('160×600');
  });

  it('广告位 key 不重复', () => {
    expect(new Set(AD_SLOT_KEYS).size).toBe(AD_SLOT_KEYS.length);
  });
});

/**
 * 广告位名称与位置说明是 7 个语种各一份手写条目，加位时极易漏翻，
 * 漏了会让后台下拉直接显示裸 key。以 zh-CN 为基准做一致性断言
 * （其余语种由 scripts/check-translations.mjs 的 pre-commit 钩子兜底）。
 */
describe('广告位翻译完整性', () => {
  const slots = (
    zhCN as unknown as {
      admin: {
        advertise: {
          slots: Record<string, { name?: string; position?: string }>;
        };
      };
    }
  ).admin.advertise.slots;

  it.each(AD_SLOT_META.map((m) => m.key))('%s 有名称与位置说明', (key) => {
    expect(slots[key]?.name, `slots.${key}.name 缺失`).toBeTruthy();
    expect(slots[key]?.position, `slots.${key}.position 缺失`).toBeTruthy();
  });

  it('没有多余的、元数据里不存在的广告位翻译条目', () => {
    expect(Object.keys(slots).sort()).toEqual([...AD_SLOT_KEYS].sort());
  });
});
