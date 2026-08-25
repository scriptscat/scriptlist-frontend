/** @vitest-environment jsdom */
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdSlot from './index';
import { GlobalConfigProvider } from '@/contexts/GlobalConfigContext';
import type { GlobalConfig } from '@/lib/api/services/system';
import type { AdSlotItem } from '@/lib/api/services/advertise';
import { advertiseService } from '@/lib/api/services/advertise';
import { useAd } from '@/lib/api/hooks/useAd';
import { RAIL_DISCLOSURE_HEIGHT } from './slots';

vi.mock('@/lib/api/hooks/useAd', () => ({ useAd: vi.fn() }));

vi.mock('next-intl', () => ({
  useLocale: () => 'zh-CN',
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/contexts/ThemeClientContext', () => ({
  useTheme: () => ({ themeMode: { mode: 'light', theme: 'light' } }),
}));

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const mockedUseAd = vi.mocked(useAd);

/** 记录所有被创建的 IntersectionObserver，便于手动触发进入视口。 */
const observers: {
  cb: IntersectionObserverCallback;
  elements: Element[];
  disconnected: boolean;
}[] = [];

class FakeIntersectionObserver {
  private readonly entry: (typeof observers)[number];
  constructor(cb: IntersectionObserverCallback) {
    this.entry = { cb, elements: [], disconnected: false };
    observers.push(this.entry);
  }
  observe(el: Element) {
    this.entry.elements.push(el);
  }
  disconnect() {
    this.entry.disconnected = true;
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function enterViewport() {
  act(() => {
    for (const o of observers) {
      if (o.disconnected) continue;
      o.cb(
        o.elements.map(
          (target) =>
            ({ isIntersecting: true, target }) as IntersectionObserverEntry,
        ),
        {} as IntersectionObserver,
      );
    }
  });
}

const imageAd: AdSlotItem = {
  id: 7,
  ad_type: 'image',
  ad_unit_id: '',
  image_url_light: 'https://cdn.example.com/light.png',
  image_url_dark: 'https://cdn.example.com/dark.png',
  link_url: 'https://advertiser.example.com',
  title: '示例广告',
};

const adsenseAd: AdSlotItem = {
  id: 9,
  ad_type: 'adsense',
  ad_unit_id: '1234567890',
  image_url_light: '',
  image_url_dark: '',
  link_url: '',
  title: '后台备注标题',
};

function setAd(ad: AdSlotItem | null) {
  mockedUseAd.mockReturnValue({ data: { ad } } as ReturnType<typeof useAd>);
}

const config: GlobalConfig = {
  turnstile_site_key: '',
  qq_migrate_enabled: false,
  adsense_publisher_id: 'ca-pub-0000000000000000',
};

function renderSlot(
  variant: 'banner' | 'card' | 'rail',
  slot = 'home-banner',
  cfg: GlobalConfig = config,
) {
  return render(
    <GlobalConfigProvider config={cfg}>
      <AdSlot slot={slot} variant={variant} />
    </GlobalConfigProvider>,
  );
}

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle = [];
  vi.spyOn(advertiseService, 'reportImpression').mockResolvedValue(
    {} as Record<string, never>,
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
});

describe('AdSlot 图片广告分支', () => {
  it('保持原有渲染：图片、站内点击链接与曝光上报', () => {
    setAd(imageAd);
    const { container } = renderSlot('banner');

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', imageAd.image_url_light);

    const link = container.querySelector('a');
    expect(link).toHaveAttribute(
      'href',
      '/api/v2/advertise/7/click?slot=home-banner&lang=zh-CN&theme=light',
    );

    expect(container.querySelector('ins.adsbygoogle')).toBeNull();

    enterViewport();
    expect(advertiseService.reportImpression).toHaveBeenCalledWith(
      7,
      'home-banner',
      'zh-CN',
    );
  });

  it('card 变体披露文案带素材标题', () => {
    setAd(imageAd);
    const { container } = renderSlot('card', 'search-sidebar');
    expect(container.textContent).toContain(`label · ${imageAd.title}`);
  });
});

describe('AdSlot AdSense 分支', () => {
  it('渲染 AdSense 广告单元，不上报曝光、不生成站内跳转链接', () => {
    setAd(adsenseAd);
    const { container } = renderSlot('banner');

    const ins = container.querySelector('ins.adsbygoogle');
    expect(ins).not.toBeNull();
    expect(ins).toHaveAttribute('data-ad-client', config.adsense_publisher_id);
    expect(ins).toHaveAttribute('data-ad-slot', adsenseAd.ad_unit_id);

    // 不得生成站内跳转链接（把 Google 广告包进重定向违反政策）
    expect(container.querySelector('a')).toBeNull();

    // 不得上报曝光——Google 自行计数
    enterViewport();
    expect(advertiseService.reportImpression).not.toHaveBeenCalled();

    // 已排入 adsbygoogle 渲染队列
    expect(
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle,
    ).toHaveLength(1);
  });

  it('披露只显示「广告」标签，不带素材标题', () => {
    setAd(adsenseAd);
    const { container } = renderSlot('card', 'search-sidebar');
    expect(container.textContent).toContain('label');
    expect(container.textContent).not.toContain(adsenseAd.title);
  });

  it('banner 横向自适应且不裁剪高度', () => {
    setAd(adsenseAd);
    const { container } = renderSlot('banner');
    const wrapper = container.querySelector<HTMLElement>(
      '[data-ad-render="adsense"]',
    )!;
    expect(wrapper.className).not.toMatch(/max-h-/);
    expect(wrapper.className).not.toMatch(/overflow-hidden/);
    expect(wrapper.className).toMatch(/w-full/);
    const ins = container.querySelector<HTMLElement>('ins.adsbygoogle')!;
    expect(ins).toHaveAttribute('data-ad-format', 'horizontal');
    expect(ins.style.height).toBe('');
  });

  // search-sidebar 是 antd Col lg={6}：内容区最宽 1280px 时该列约 300px，
  // 992px 断点处更窄到 ~220px。固定 300px 的单元在这里会被 flex 压缩、再被
  // overflow-hidden 裁掉一截——缩放或裁剪广告单元违反 AdSense 政策。
  it('card 用响应式单元，窄侧栏里不会被压缩或裁剪', () => {
    setAd(adsenseAd);
    const { container } = renderSlot('card', 'search-sidebar');
    const wrapper = container.querySelector<HTMLElement>(
      '[data-ad-render="adsense"]',
    )!;
    expect(wrapper.className).not.toMatch(/overflow-hidden/);

    const ins = container.querySelector<HTMLElement>('ins.adsbygoogle')!;
    expect(ins.style.width).toBe('100%');
    expect(ins.style.height).toBe('');
    expect(ins.style.display).toBe('block');
    expect(ins).toHaveAttribute('data-ad-format', 'rectangle');
    expect(ins).toHaveAttribute('data-full-width-responsive', 'true');
    // 单元不能是可压缩的 flex item
    expect(ins.parentElement!.className).not.toMatch(/\bflex\b/);
  });

  it('rail 固定 160×600', () => {
    setAd(adsenseAd);
    const { container } = renderSlot('rail', 'search-rail-left');
    const ins = container.querySelector<HTMLElement>('ins.adsbygoogle')!;
    expect(ins.style.width).toBe('160px');
    expect(ins.style.height).toBe('600px');
  });

  it('Google 标记未填充时容器折叠', async () => {
    setAd(adsenseAd);
    const { container } = renderSlot('card', 'search-sidebar');
    const wrapper = container.querySelector<HTMLElement>(
      '[data-ad-render="adsense"]',
    )!;
    const ins = container.querySelector<HTMLElement>('ins.adsbygoogle')!;
    expect(wrapper).toBeVisible();

    ins.setAttribute('data-ad-status', 'unfilled');
    await act(async () => {
      await Promise.resolve();
    });

    expect(wrapper).not.toBeVisible();
  });

  it('脚本被拦截（迟迟无状态）时容器同样折叠', () => {
    vi.useFakeTimers();
    setAd(adsenseAd);
    const { container } = renderSlot('banner');
    const wrapper = container.querySelector<HTMLElement>(
      '[data-ad-render="adsense"]',
    )!;
    expect(wrapper).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(wrapper).not.toBeVisible();
  });

  it('脚本已加载但状态未定时保持占位，不提前折叠', () => {
    vi.useFakeTimers();
    setAd(adsenseAd);
    const { container } = renderSlot('banner');
    // adsbygoogle.js 加载后会把队列换成带 loaded 标记的对象
    (window as unknown as { adsbygoogle: { loaded: boolean } }).adsbygoogle = {
      loaded: true,
    };
    const wrapper = container.querySelector<HTMLElement>(
      '[data-ad-render="adsense"]',
    )!;

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(wrapper).toBeVisible();
  });

  it('发布商 ID 为空时不渲染广告单元', () => {
    setAd(adsenseAd);
    const { container } = renderSlot('banner', 'home-banner', {
      ...config,
      adsense_publisher_id: '',
    });
    expect(container.querySelector('ins.adsbygoogle')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });
});

describe('AdSlot rail 披露行', () => {
  it('高度固定，使 rail 整块高度可被 SideRails 精确预留', () => {
    setAd(adsenseAd);
    const { container } = renderSlot('rail', 'search-rail-left');
    const wrapper = container.querySelector<HTMLElement>(
      '[data-ad-render="adsense"]',
    )!;
    const ins = container.querySelector<HTMLElement>('ins.adsbygoogle')!;
    const disclosure = wrapper.firstElementChild as HTMLElement;

    expect(disclosure).not.toBe(ins);
    expect(disclosure.style.height).toBe(`${RAIL_DISCLOSURE_HEIGHT}px`);
    // 披露行不得盖在广告单元上（遮挡广告违反政策）
    expect(disclosure.contains(ins)).toBe(false);
  });
});
