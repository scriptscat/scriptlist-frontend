/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SideRails from './SideRails';
import { RAIL_DISCLOSURE_HEIGHT } from './slots';

// SideRails 只负责摆位；广告本身用桩替代，避免拉起 SWR / next-intl / 主题上下文。
vi.mock('./index', () => ({
  default: ({ slot }: { slot: string }) => (
    <div data-testid="rail-ad" data-slot={slot} />
  ),
}));

const RAIL_WIDTH = 160;
const RAIL_HEIGHT = 600;
const CONTENT_GAP = 24;
const TOP_SAFE_GAP = 16;

class FakeResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

/** 造一个内容容器并固定它的实测位置，模拟某个视口宽度下的留白。 */
function mountContent(left: number, right: number) {
  const el = document.createElement('div');
  el.setAttribute('data-search-content', '');
  el.getBoundingClientRect = () =>
    ({
      left,
      right,
      top: 0,
      bottom: 0,
      width: right - left,
      height: 0,
    }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

function rails() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-testid="rail-ad"]'),
  ).map((ad) => ad.parentElement!.parentElement!);
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  window.innerWidth = 1600;
  window.innerHeight = 1000;
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('SideRails 布局', () => {
  it('每侧留白 >= 200px 时投放，且按原尺寸摆在内容两侧', () => {
    // 1600px 视口、内容区宽 1200 → 每侧留白 200
    mountContent(200, 1400);
    render(<SideRails />);

    const [leftRail, rightRail] = rails();
    expect(leftRail).toBeTruthy();
    expect(rightRail).toBeTruthy();
    expect(leftRail.style.left).toBe(`${200 - CONTENT_GAP - RAIL_WIDTH}px`);
    expect(rightRail.style.left).toBe(`${1400 + CONTENT_GAP}px`);
    expect(leftRail.style.width).toBe(`${RAIL_WIDTH}px`);
  });

  it('预留高度含披露行，广告单元 600px 不被挤出预留区', () => {
    mountContent(200, 1400);
    render(<SideRails />);

    const blockHeight = RAIL_HEIGHT + RAIL_DISCLOSURE_HEIGHT;
    const [leftRail] = rails();
    expect(leftRail.style.height).toBe(`${blockHeight}px`);

    // 居中同样按整块高度算，否则整块会比预留区低半个披露行
    const available = window.innerHeight - TOP_SAFE_GAP;
    expect(leftRail.style.top).toBe(
      `${TOP_SAFE_GAP + (available - blockHeight) / 2}px`,
    );
  });

  it('留白不足以完整容纳广告时整体隐藏', () => {
    // 每侧留白 190 < 24 + 16 + 160
    mountContent(190, 1410);
    render(<SideRails />);

    expect(rails()).toHaveLength(0);
  });
});
