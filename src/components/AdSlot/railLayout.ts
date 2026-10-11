import type { AdSlotItem } from '@/lib/api/services/advertise';
import { prefetchAd } from '@/lib/api/services/advertise';

type PrefetchResult = { ad: AdSlotItem | null } | undefined;

/** 内容区基础宽度：全站容器同款的居中 + 1280px 上限。 */
const BASE_CLASS = 'mx-auto w-full max-w-7xl';

/**
 * 有竖栏投放时的收窄样式：≥1400px 起每侧让出 200px（竖栏 160 + 内容间距 24 +
 * 边缘 16），刚好够 SideRails 的 MIN_GUTTER。1680px 起 calc 结果不再小于
 * 1280px，收窄自然失效，版面回到原状。
 */
const NARROW_CLASS = 'min-[1400px]:max-w-[min(80rem,calc(100vw_-_400px))]';

/** 两侧预取结果里是否真有广告。预取失败（undefined）按无广告处理。 */
export function hasRailAd(
  left: PrefetchResult,
  right: PrefetchResult,
): boolean {
  return Boolean(left?.ad || right?.ad);
}

/**
 * 承载竖栏的内容容器该带的属性。定位标记与收窄样式必须同源：只有真拿到广告
 * 才既收窄又让 SideRails 找得到容器，否则页面宽度与不含本功能时完全一致。
 */
export function railContainerProps(hasAd: boolean): {
  className: string;
  'data-rail-content'?: string;
} {
  if (!hasAd) {
    return { className: BASE_CLASS };
  }
  return {
    className: `${BASE_CLASS} ${NARROW_CLASS}`,
    'data-rail-content': '',
  };
}

/**
 * 服务端预取一对左右竖栏广告。任一侧失败都按无广告降级，不阻断页面渲染
 * （prefetchAd 自身已吞掉异常并返回 undefined）。
 */
export async function prefetchRails(
  leftSlot: string,
  rightSlot: string,
  locale: string,
) {
  const [left, right] = await Promise.all([
    prefetchAd(leftSlot, locale),
    prefetchAd(rightSlot, locale),
  ]);
  return { left, right, hasAd: hasRailAd(left, right) };
}
