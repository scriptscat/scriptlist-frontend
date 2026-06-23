'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import AdSlot from './index';

const RAIL_WIDTH = 160;
const RAIL_HEIGHT = 600;
const CONTENT_GAP = 24; // 广告与中间内容之间的距离
const EDGE_GAP = 16; // 广告与屏幕边缘之间的距离
const MIN_SCALE = 0.625; // 广告最小缩放：160px → 100px
const TOP_SAFE_GAP = 16;
// 一侧留白不足以放下（缩放后的）广告 + 两侧间距时，隐藏侧栏广告。
const MIN_GUTTER = CONTENT_GAP + EDGE_GAP + RAIL_WIDTH * MIN_SCALE; // 140

// 搜索浏览页的内容容器，宽度由 CSS 流式控制；这里实测它的真实位置来摆放广告。
const CONTENT_SELECTOR = '[data-search-content]';

interface RailLayout {
  visible: boolean;
  contentLeft: number;
  contentRight: number;
  scale: number;
  top: number;
}

const HIDDEN_LAYOUT: RailLayout = {
  visible: false,
  contentLeft: 0,
  contentRight: 0,
  scale: 1,
  top: 0,
};

function measureTopOffset() {
  const header = document.querySelector<HTMLElement>('[data-layout-header]');
  const announcement = document.querySelector<HTMLElement>(
    '[data-layout-announcement]',
  );
  const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
  const announcementBottom = announcement?.getBoundingClientRect().bottom ?? 0;
  return Math.max(headerBottom, announcementBottom, 0) + TOP_SAFE_GAP;
}

function getRailLayout(): RailLayout {
  const content = document.querySelector<HTMLElement>(CONTENT_SELECTOR);
  if (!content) return HIDDEN_LAYOUT;

  const rect = content.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 取较窄一侧的留白，保证左右广告对称且都放得下。
  const gutter = Math.min(rect.left, viewportWidth - rect.right);
  // 留白越小广告缩得越小，正好让出 CONTENT_GAP（距内容）和 EDGE_GAP（距边缘）。
  const scale = Math.min(
    1,
    Math.max(MIN_SCALE, (gutter - CONTENT_GAP - EDGE_GAP) / RAIL_WIDTH),
  );
  const scaledHeight = RAIL_HEIGHT * scale;
  const topOffset = measureTopOffset();
  const availableHeight = Math.max(0, viewportHeight - topOffset);
  const top = topOffset + Math.max(0, (availableHeight - scaledHeight) / 2);

  return {
    visible: gutter >= MIN_GUTTER,
    contentLeft: rect.left,
    contentRight: rect.right,
    scale,
    top,
  };
}

export default function SideRails() {
  const [layout, setLayout] = useState<RailLayout>(HIDDEN_LAYOUT);

  useEffect(() => {
    const update = () => setLayout(getRailLayout());
    const resizeObserver = new ResizeObserver(update);
    const mutationObserver = new MutationObserver(update);

    update();
    window.addEventListener('resize', update);
    document
      .querySelectorAll(
        `${CONTENT_SELECTOR}, [data-layout-header], [data-layout-announcement]`,
      )
      .forEach((el) => resizeObserver.observe(el));
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  if (!layout.visible) return null;

  const scaledWidth = RAIL_WIDTH * layout.scale;
  const scaledHeight = RAIL_HEIGHT * layout.scale;

  // 广告固定在内容两侧留白里：距内容 CONTENT_GAP，按留白缩放，并保证距屏幕边缘约 EDGE_GAP。
  const railStyle = (left: number): CSSProperties => ({
    position: 'fixed',
    top: layout.top,
    left,
    width: scaledWidth,
    height: scaledHeight,
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
      <div style={railStyle(layout.contentLeft - CONTENT_GAP - scaledWidth)}>
        <div style={innerStyle}>
          <AdSlot slot="search-rail-left" variant="rail" />
        </div>
      </div>
      <div style={railStyle(layout.contentRight + CONTENT_GAP)}>
        <div style={innerStyle}>
          <AdSlot slot="search-rail-right" variant="rail" />
        </div>
      </div>
    </>
  );
}
