'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import AdSlot from './index';

const MIN_WIDTH = 1500;
const CONTENT_WIDTH_COMPACT = 1240;
const CONTENT_WIDTH_DEFAULT = 1280;
const DEFAULT_LAYOUT_MIN_WIDTH = 1632;
const RAIL_WIDTH = 160;
const RAIL_HEIGHT = 600;
const RAIL_GAP_COMPACT = 8;
const RAIL_GAP_DEFAULT = 16;
const MIN_SCALE = 0.625;
const TOP_SAFE_GAP = 16;

interface RailLayout {
  contentWidth: number;
  gap: number;
  scale: number;
  top: number;
  wideEnough: boolean;
}

function measureTopOffset() {
  const header = document.querySelector<HTMLElement>('[data-layout-header]');
  const announcement = document.querySelector<HTMLElement>(
    '[data-layout-announcement]',
  );
  const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
  const announcementBottom = announcement?.getBoundingClientRect().bottom ?? 0;
  return Math.max(headerBottom, announcementBottom, 0) + TOP_SAFE_GAP;
}

function getContentWidth(viewportWidth: number) {
  return viewportWidth >= DEFAULT_LAYOUT_MIN_WIDTH
    ? CONTENT_WIDTH_DEFAULT
    : CONTENT_WIDTH_COMPACT;
}

function getRailGap(viewportWidth: number) {
  return viewportWidth >= DEFAULT_LAYOUT_MIN_WIDTH
    ? RAIL_GAP_DEFAULT
    : RAIL_GAP_COMPACT;
}

function getRailLayout(): RailLayout {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const contentWidth = getContentWidth(viewportWidth);
  const gap = getRailGap(viewportWidth);
  const availableGutter = Math.max(0, (viewportWidth - contentWidth) / 2);
  const scale = Math.min(
    1,
    Math.max(MIN_SCALE, (availableGutter - gap) / RAIL_WIDTH),
  );
  const scaledHeight = RAIL_HEIGHT * scale;
  const topOffset = measureTopOffset();
  const availableHeight = Math.max(0, viewportHeight - topOffset);
  const top = topOffset + Math.max(0, (availableHeight - scaledHeight) / 2);

  return {
    contentWidth,
    gap,
    scale,
    top,
    wideEnough: viewportWidth >= MIN_WIDTH,
  };
}

export default function SideRails() {
  const [layout, setLayout] = useState<RailLayout>({
    contentWidth: CONTENT_WIDTH_DEFAULT,
    gap: RAIL_GAP_DEFAULT,
    scale: 1,
    top: 0,
    wideEnough: false,
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => setLayout(getRailLayout());
    const resizeObserver = new ResizeObserver(update);
    const mutationObserver = new MutationObserver(update);

    update();
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    document
      .querySelectorAll('[data-layout-header], [data-layout-announcement]')
      .forEach((el) => resizeObserver.observe(el));
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  if (!layout.wideEnough) return null;

  const scaledWidth = RAIL_WIDTH * layout.scale;
  const scaledHeight = RAIL_HEIGHT * layout.scale;

  // 1500-1631px 时搜索浏览页内容区临时收窄到 1240px；空间足够后恢复原 1280px 和 16px 间隔。
  // 1500px 阈值用于覆盖 1536px 物理屏扣除浏览器边框后的常见 viewport。
  const railStyle = (side: 'left' | 'right'): CSSProperties => ({
    position: 'fixed',
    top: layout.top,
    width: scaledWidth,
    height: scaledHeight,
    [side]: `calc((100vw - ${layout.contentWidth}px) / 2 - ${
      scaledWidth + layout.gap
    }px)`,
    zIndex: 20,
  });

  const innerStyle: CSSProperties = {
    width: RAIL_WIDTH,
    height: RAIL_HEIGHT,
    transform: `scale(${layout.scale})`,
    transformOrigin: 'top left',
  };

  return (
    <>
      <div style={railStyle('left')}>
        <div style={innerStyle}>
          <AdSlot slot="search-rail-left" variant="rail" />
        </div>
      </div>
      <div style={railStyle('right')}>
        <div style={innerStyle}>
          <AdSlot slot="search-rail-right" variant="rail" />
        </div>
      </div>
    </>
  );
}
