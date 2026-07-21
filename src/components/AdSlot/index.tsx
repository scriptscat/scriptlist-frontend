'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { useTheme } from '@/contexts/ThemeClientContext';
import { useAd } from '@/lib/api/hooks/useAd';
import type { AdSlotItem } from '@/lib/api/services/advertise';
import { advertiseService } from '@/lib/api/services/advertise';

interface AdSlotProps {
  slot: string;
  variant: 'banner' | 'card' | 'rail';
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
  const { data } = useAd(slot, locale, initialData);
  const ad = data?.ad ?? null;
  const ref = useRef<HTMLDivElement>(null);
  const reportedAdId = useRef<number | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!ad || !ref.current || reportedAdId.current === ad.id) return;
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
  }, [ad, slot, locale]);

  if (!ad) return null;

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
