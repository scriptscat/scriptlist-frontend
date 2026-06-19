'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import AdSlot from './index';

const MIN_WIDTH = 1650;

export default function SideRails() {
  const [wideEnough, setWideEnough] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => setWideEnough(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!wideEnough) return null;

  // 落在居中内容区(max-w 1280px)两侧 gutter
  const railStyle = (side: 'left' | 'right'): CSSProperties => ({
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 'calc((100vw - 1280px) / 2 - 176px)',
    zIndex: 20,
  });

  return (
    <>
      <div style={railStyle('left')}>
        <AdSlot slot="search-rail-left" variant="rail" />
      </div>
      <div style={railStyle('right')}>
        <AdSlot slot="search-rail-right" variant="rail" />
      </div>
    </>
  );
}
