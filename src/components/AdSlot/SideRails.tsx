'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import AdSlot from './index';

const STORAGE_KEY = 'ad-rail-closed';
const MIN_WIDTH = 1650;

export default function SideRails() {
  const t = useTranslations('ads');
  const [wideEnough, setWideEnough] = useState(false);
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is a browser-only API unavailable at render time; mount-only read is intentional
    setClosed(localStorage.getItem(STORAGE_KEY) === '1');
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => setWideEnough(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!wideEnough || closed) return null;

  const close = () => {
    setClosed(true);
    localStorage.setItem(STORAGE_KEY, '1');
  };

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
        <RailBox onClose={close} closeLabel={t('close')}>
          <AdSlot slot="search-rail-left" variant="rail" />
        </RailBox>
      </div>
      <div style={railStyle('right')}>
        <RailBox onClose={close} closeLabel={t('close')}>
          <AdSlot slot="search-rail-right" variant="rail" />
        </RailBox>
      </div>
    </>
  );
}

function RailBox({
  children,
  onClose,
  closeLabel,
}: {
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute -top-3 right-0 z-30 h-5 w-5 rounded-full bg-black/50 text-xs text-white"
      >
        {'×'}
      </button>
      {children}
    </div>
  );
}
