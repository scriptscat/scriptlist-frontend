'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import AdSlot from './index';
import { RAIL_DISCLOSURE_HEIGHT } from './slots';

const RAIL_WIDTH = 160;
const RAIL_HEIGHT = 600;
// 广告单元上方还有一行「广告」披露（不能盖在单元上，会遮挡广告），整块因此比
// 广告单元本身高一行；预留与居中都按整块算，广告单元才不会被挤出预留区。
const RAIL_BLOCK_HEIGHT = RAIL_HEIGHT + RAIL_DISCLOSURE_HEIGHT;
const CONTENT_GAP = 24; // 广告与中间内容之间的距离
const EDGE_GAP = 16; // 广告与屏幕边缘之间的距离
const TOP_SAFE_GAP = 16;
// 一侧留白不足以放下广告 + 两侧间距时，隐藏侧栏广告。
const MIN_GUTTER = CONTENT_GAP + EDGE_GAP + RAIL_WIDTH; // 200

// 搜索浏览页的内容容器，宽度由 CSS 流式控制；这里实测它的真实位置来摆放广告。
const CONTENT_SELECTOR = '[data-search-content]';

interface RailLayout {
  visible: boolean;
  contentLeft: number;
  contentRight: number;
  top: number;
}

const HIDDEN_LAYOUT: RailLayout = {
  visible: false,
  contentLeft: 0,
  contentRight: 0,
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
  // 广告以原尺寸 160×600 呈现，不进行缩放。
  const topOffset = measureTopOffset();
  const availableHeight = Math.max(0, viewportHeight - topOffset);
  const top =
    topOffset + Math.max(0, (availableHeight - RAIL_BLOCK_HEIGHT) / 2);

  return {
    visible: gutter >= MIN_GUTTER,
    contentLeft: rect.left,
    contentRight: rect.right,
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

  // 广告以原尺寸 160×600 呈现。
  const railStyle = (left: number): CSSProperties => ({
    position: 'fixed',
    top: layout.top,
    left,
    width: RAIL_WIDTH,
    height: RAIL_BLOCK_HEIGHT,
    zIndex: 20,
  });

  const innerStyle: CSSProperties = {
    width: RAIL_WIDTH,
    height: RAIL_BLOCK_HEIGHT,
  };

  return (
    <>
      <div style={railStyle(layout.contentLeft - CONTENT_GAP - RAIL_WIDTH)}>
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
