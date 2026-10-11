'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { useTheme } from '@/contexts/ThemeClientContext';
import { useGlobalConfig } from '@/contexts/GlobalConfigContext';
import { useAd } from '@/lib/api/hooks/useAd';
import type { AdSlotItem } from '@/lib/api/services/advertise';
import { advertiseService, resolveAdType } from '@/lib/api/services/advertise';
import { RAIL_DISCLOSURE_HEIGHT } from './slots';

type AdVariant = 'banner' | 'card' | 'rail';

interface AdSlotProps {
  slot: string;
  variant: AdVariant;
  className?: string;
  /** 服务端预取的广告数据，用于 SSR 注入 SWR fallbackData。 */
  initialData?: { ad: AdSlotItem | null };
}

const SIZE: Record<'banner' | 'rail', string> = {
  banner: 'w-full max-h-[120px]',
  rail: 'w-[160px] h-[600px]',
};

export default function AdSlot({
  slot,
  variant,
  className,
  initialData,
}: AdSlotProps) {
  const locale = useLocale();
  const t = useTranslations('ads');
  const { themeMode } = useTheme();
  const { adsense_publisher_id: adsensePublisherId } = useGlobalConfig();
  const { data } = useAd(slot, locale, initialData);
  const ad = data?.ad ?? null;
  const ref = useRef<HTMLDivElement>(null);
  const reportedAdId = useRef<number | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const isAdSense = ad !== null && resolveAdType(ad) === 'adsense';

  useEffect(() => {
    // AdSense 广告由 Google 自行计曝光，站内不得再上报（重复计数且违反政策）。
    if (!ad || isAdSense || !ref.current || reportedAdId.current === ad.id)
      return;
    const currentId = ad.id;
    const el = ref.current;
    const ob = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        reportedAdId.current = currentId;
        void advertiseService.reportImpression(currentId, slot, locale);
        ob.disconnect();
      }
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, [ad, isAdSense, slot, locale]);

  if (!ad) return null;

  // AdSense 分支：由 Google 广告单元自行渲染、计曝光与计点击，
  // 因此这里既不套站内跳转链接，也不做曝光上报。
  // 发布商 ID 未配置时无法构造合法广告单元，直接不渲染。
  if (isAdSense) {
    if (!adsensePublisherId || !ad.ad_unit_id) return null;
    return (
      <AdSenseUnit
        key={ad.id}
        publisherId={adsensePublisherId}
        adUnitId={ad.ad_unit_id}
        variant={variant}
        className={className}
        label={t('label')}
      />
    );
  }

  const img =
    themeMode.theme === 'dark' && ad.image_url_dark
      ? ad.image_url_dark
      : ad.image_url_light;

  if (img === failedSrc) return null;

  const clickHref = advertiseService.getClickHref(
    ad.id,
    slot,
    locale,
    themeMode.theme,
  );
  const adTitle = ad.title.trim() || t('sponsored');
  // Footer disclosure: always lead with the「广告」label, then the creative's
  // title (「广告 · {title}」). When the ad has no title, fall back to the
  // ready-made sponsored phrase so we don't double up the label.
  const sponsoredLabel = ad.title.trim()
    ? `${t('label')} · ${ad.title.trim()}`
    : t('sponsored');

  // Sidebar 300×250 slots: wrap the creative in a GitHub-style card so it sits
  // consistently among the bordered cards around it. The disclosure + a
  // "learn more" affordance live in a thin footer instead of a badge over the
  // image (方案 C, docs/superpowers/specs/2026-06-19-ad-slot-card-ui-design.md).
  if (variant === 'card') {
    return (
      <div
        ref={ref}
        className={`bg-app-elevated border-app-primary theme-transition mx-auto w-full max-w-[332px] overflow-hidden rounded-lg border ${
          className ?? ''
        }`}
      >
        <a
          href={clickHref}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="block transition-shadow hover:shadow-sm"
        >
          <div className="p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={adTitle}
              className="bg-app-tertiary block h-[250px] w-full rounded-md object-contain"
              onError={() => setFailedSrc(img)}
            />
          </div>
          <div className="border-app-primary flex items-center justify-between border-t px-3 py-2">
            <span className="text-app-tertiary flex items-center gap-1 text-[11px]">
              <Icon icon="mdi:bullhorn-outline" className="text-[13px]" />
              {sponsoredLabel}
            </span>
            <span className="text-app-secondary text-[11px]">
              {t('learnMore')}
            </span>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-lg ${SIZE[variant]} ${className ?? ''}`}
    >
      <span className="absolute top-1 right-1 z-10 rounded bg-black/40 px-1 text-[10px] text-white">
        {t('label')}
      </span>
      <a href={clickHref} target="_blank" rel="nofollow sponsored noopener">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={adTitle}
          className="block h-full w-full object-contain"
          onError={() => setFailedSrc(img)}
        />
      </a>
    </div>
  );
}

/**
 * 广告单元迟迟拿不到 data-ad-status 时的兜底判定窗口（毫秒）。
 * 广告拦截器会让 adsbygoogle.js 根本加载不了，Google 也就永远不会写状态；
 * 超时后按未填充处理，容器折叠，不留空白占位。
 */
const ADSENSE_FILL_TIMEOUT_MS = 8000;

/** adsbygoogle.js 加载后会把队列数组替换成带 loaded 标记的对象。 */
function isAdSenseScriptLoaded(): boolean {
  const queue = (window as unknown as { adsbygoogle?: { loaded?: boolean } })
    .adsbygoogle;
  return queue?.loaded === true;
}

// <ins> 自身的尺寸。banner / card 交给 Google 的自适应格式（不设死高度，
// 避免裁剪广告）：card 所在的侧栏（antd Col lg={6}）实测只有 ~220–300px，
// 写死 300px 会被压缩再被裁掉。rail 的容器由 SideRails 保证有完整 160×600，
// 才可以固定像素尺寸。
const ADSENSE_INS_STYLE: Record<AdVariant, CSSProperties> = {
  banner: { display: 'block', width: '100%' },
  card: { display: 'block', width: '100%' },
  rail: { display: 'inline-block', width: '160px', height: '600px' },
};

// 自适应单元的格式提示：banner 走横幅，card 走矩形。
const ADSENSE_RESPONSIVE_FORMAT: Partial<Record<AdVariant, string>> = {
  banner: 'horizontal',
  card: 'rectangle',
};

// 外层容器：都**不得**带高度上限或 overflow-hidden（会裁剪/遮挡广告，
// 违反 AdSense 政策）。
const ADSENSE_WRAPPER_CLASS: Record<AdVariant, string> = {
  banner: 'w-full',
  // card 沿用站内边框卡片外观，但**不得**带 overflow-hidden（会裁掉广告单元）。
  card: 'bg-app-elevated border-app-primary theme-transition mx-auto w-full max-w-[332px] rounded-lg border',
  rail: 'w-[160px]',
};

interface AdSenseUnitProps {
  publisherId: string;
  adUnitId: string;
  variant: AdVariant;
  className?: string;
  /** 广告披露文案。AdSense 只显示「广告」，不带素材标题（标题只是后台备注）。 */
  label: string;
}

function AdSenseUnit({
  publisherId,
  adUnitId,
  variant,
  className,
  label,
}: AdSenseUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [status, setStatus] = useState<'pending' | 'filled' | 'unfilled'>(
    'pending',
  );

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    // Google 填充完成后会在 <ins> 上写 data-ad-status=filled/unfilled。
    const sync = () => {
      const value = el.getAttribute('data-ad-status');
      if (value === 'filled') setStatus('filled');
      else if (value === 'unfilled') setStatus('unfilled');
    };
    const observer = new MutationObserver(sync);
    observer.observe(el, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
    });
    sync();

    if (!pushed.current) {
      pushed.current = true;
      try {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle ?? [];
        w.adsbygoogle.push({});
      } catch {
        // 脚本被拦截或重复入队时忽略：容器会在超时后折叠。
      }
    }

    // 脚本已加载却还没写状态，说明 Google 只是慢——继续等，别把位子提前藏掉
    // （藏掉的位子 Google 一律判未填充，会把「慢」变成「永远没广告」）。
    const timer = window.setTimeout(() => {
      if (isAdSenseScriptLoaded()) return;
      setStatus((prev) => (prev === 'pending' ? 'unfilled' : prev));
    }, ADSENSE_FILL_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // 未填充（含被拦截）时整体折叠为零高度，不留空白占位。
  const collapsed = status === 'unfilled';

  const disclosure = (
    <span className="text-app-tertiary flex items-center gap-1 text-[11px]">
      <Icon icon="mdi:bullhorn-outline" className="text-[13px]" />
      {label}
    </span>
  );

  const unit = (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={ADSENSE_INS_STYLE[variant]}
      data-ad-client={publisherId}
      data-ad-slot={adUnitId}
      {...(ADSENSE_RESPONSIVE_FORMAT[variant]
        ? {
            'data-ad-format': ADSENSE_RESPONSIVE_FORMAT[variant],
            'data-full-width-responsive': 'true',
          }
        : {})}
    />
  );

  const wrapperProps = {
    'data-ad-render': 'adsense',
    style: collapsed ? { display: 'none' } : undefined,
    className: `${ADSENSE_WRAPPER_CLASS[variant]} ${className ?? ''}`,
  };

  if (variant === 'card') {
    return (
      <div {...wrapperProps}>
        {/* 自适应单元用普通块级容器：flex item 会被压缩，压缩=缩放广告。 */}
        <div className="p-2">{unit}</div>
        <div className="border-app-primary flex items-center border-t px-3 py-2">
          {disclosure}
        </div>
      </div>
    );
  }

  return (
    <div {...wrapperProps}>
      {/* rail 的披露行高度定死，SideRails 才能精确预留整块高度（见 slots.ts）。 */}
      <div
        className={
          variant === 'rail' ? 'flex items-center overflow-hidden' : 'pb-0.5'
        }
        style={
          variant === 'rail' ? { height: RAIL_DISCLOSURE_HEIGHT } : undefined
        }
      >
        {disclosure}
      </div>
      {unit}
    </div>
  );
}
