'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import AdSlot from './index';

const MIN_WIDTH = 1500;
const CONTENT_WIDTH_COMPACT = 1240;
const CONTENT_WIDTH_DEFAULT = 1280;
const COMPACT_MAX_WIDTH = 1599;
const RAIL_WIDTH = 160;
const RAIL_HEIGHT = 600;
const RAIL_GAP = 8;
const MIN_SCALE = 0.625;

export default function SideRails() {
  const [wideEnough, setWideEnough] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => {
      const contentWidth =
        window.innerWidth <= COMPACT_MAX_WIDTH
          ? CONTENT_WIDTH_COMPACT
          : CONTENT_WIDTH_DEFAULT;
      const availableGutter = Math.max(
        0,
        (window.innerWidth - contentWidth) / 2,
      );
      const nextScale = Math.min(
        1,
        Math.max(MIN_SCALE, (availableGutter - RAIL_GAP) / RAIL_WIDTH),
      );
      setWideEnough(mq.matches);
      setScale(nextScale);
    };
    update();
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!wideEnough) return null;

  const contentWidth =
    window.innerWidth <= COMPACT_MAX_WIDTH
      ? CONTENT_WIDTH_COMPACT
      : CONTENT_WIDTH_DEFAULT;
  const scaledWidth = RAIL_WIDTH * scale;
  const scaledHeight = RAIL_HEIGHT * scale;

  // 1500-1599px 时搜索浏览页内容区临时收窄到 1240px；更大屏恢复 1280px。
  // 1500px 阈值用于覆盖 1536px 物理屏扣除浏览器边框后的常见 viewport。
  const railStyle = (side: 'left' | 'right'): CSSProperties => ({
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    width: scaledWidth,
    height: scaledHeight,
    [side]: `calc((100vw - ${contentWidth}px) / 2 - ${scaledWidth + RAIL_GAP}px)`,
    zIndex: 20,
  });

  const innerStyle: CSSProperties = {
    width: RAIL_WIDTH,
    height: RAIL_HEIGHT,
    transform: `scale(${scale})`,
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
