import type { AdSlotVariant } from '@/components/AdSlot/slots';
import { AD_SLOT_META, getAdSlotMeta } from '@/components/AdSlot/slots';

/** 一种形态下被选中的广告位，携带该形态的推荐尺寸。 */
export interface SlotVariantGroup {
  variant: AdSlotVariant;
  /** 推荐创意尺寸，如 "160×600"。同形态下各位一致。 */
  size: string;
  keys: string[];
}

export interface SlotSelectionSummary {
  /** 去重后的广告位总数，含未知项。 */
  count: number;
  /** 按形态分组，顺序跟随形态首次出现的位置。 */
  groups: SlotVariantGroup[];
  /** 是否跨越多种形态。跨形态不拦截，只用于提示。 */
  mixed: boolean;
  /** 元数据里查不到的广告位 key（后端新增而前端未同步时会出现）。 */
  unknown: string[];
}

/**
 * 汇总一份广告位多选，供创建/编辑表单驱动信息条与跨形态警告。
 *
 * 跨形态本身是允许的（图片走 object-contain 不会变形，只是留白；AdSense 复用
 * 同一个广告单元 ID 会拖低填充率），所以这里只判定、不拦截。未知 key 不参与
 * 形态分组，也不算作跨形态——形态未知时无法断言它和别的位不搭。
 */
export function describeSlotSelection(
  slotKeys: string[],
): SlotSelectionSummary {
  const seen = new Set<string>();
  const groups: SlotVariantGroup[] = [];
  const unknown: string[] = [];

  for (const key of slotKeys) {
    if (seen.has(key)) continue;
    seen.add(key);

    const meta = getAdSlotMeta(key);
    if (!meta) {
      unknown.push(key);
      continue;
    }

    const group = groups.find((g) => g.variant === meta.variant);
    if (group) {
      group.keys.push(key);
    } else {
      groups.push({ variant: meta.variant, size: meta.size, keys: [key] });
    }
  }

  return {
    count: seen.size,
    groups,
    mixed: groups.length > 1,
    unknown,
  };
}

/**
 * 把落库形态（逗号分隔、可能带空白）解析成广告位列表，规则与后端
 * `advertise_entity.ParseSlotKeys` 逐条对齐：去掉每项两端空白、丢弃空项、
 * 去重且保留首次出现的顺序。两边必须同规则——否则重复值会漏到列表页的 Tag
 * 列表（React 重复 key）和编辑表单的多选框里。
 */
export function parseSlotKeys(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of (raw || '').split(',')) {
    const key = part.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** 后台下拉分组的展示偏好顺序；不在表里的形态一律追加到末尾，绝不丢位。 */
const VARIANT_DISPLAY_ORDER: readonly AdSlotVariant[] = [
  'rail',
  'banner',
  'card',
];

/**
 * 后台「广告位」多选框的分组选项：按形态分组，同组内推荐尺寸一致。
 *
 * 顺序按 VARIANT_DISPLAY_ORDER，但分组本身是从 AD_SLOT_META 推导的——新增形态
 * 时哪怕忘了改顺序表，那些位也照样出现在下拉里（只是排在最后），不会静默变成
 * 后台无法投放的位。
 */
export function groupSlotOptions(): SlotVariantGroup[] {
  const groups: SlotVariantGroup[] = [];
  for (const meta of AD_SLOT_META) {
    const group = groups.find((g) => g.variant === meta.variant);
    if (group) group.keys.push(meta.key);
    else
      groups.push({ variant: meta.variant, size: meta.size, keys: [meta.key] });
  }
  return groups.sort((a, b) => {
    const ai = VARIANT_DISPLAY_ORDER.indexOf(a.variant);
    const bi = VARIANT_DISPLAY_ORDER.indexOf(b.variant);
    return (
      (ai < 0 ? Number.MAX_SAFE_INTEGER : ai) -
      (bi < 0 ? Number.MAX_SAFE_INTEGER : bi)
    );
  });
}

/**
 * 该条目的曝光 / 点击 / CTR 覆盖了几个广告位。统计只按 ad_id 累计（spec 决策 1），
 * 投在多个位时列表里的数字是跨位合计，必须在展示上点明；单位条目返回 0，
 * 不必加噪音。
 */
export function crossSlotAggregateCount(slotKeysRaw: string): number {
  const { count } = describeSlotSelection(parseSlotKeys(slotKeysRaw));
  return count > 1 ? count : 0;
}
