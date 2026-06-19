'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeClientContext';
import { useAd } from '@/lib/api/hooks/useAd';
import { advertiseService } from '@/lib/api/services/advertise';
import { API_CONFIG } from '@/lib/api/config';

interface AdSlotProps {
  slot: string;
  variant: 'banner' | 'card' | 'rail';
  className?: string;
}

const SIZE: Record<AdSlotProps['variant'], string> = {
  banner: 'w-full max-h-[120px]',
  card: 'w-[300px] h-[250px] mx-auto',
  rail: 'w-[160px] h-[600px]',
};

export default function AdSlot({ slot, variant, className }: AdSlotProps) {
  const locale = useLocale();
  const t = useTranslations('ads');
  const { themeMode } = useTheme();
  const { data } = useAd(slot, locale);
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

  const clickHref = `${API_CONFIG.baseURL}/advertise/${ad.id}/click?slot=${encodeURIComponent(
    slot,
  )}&lang=${encodeURIComponent(locale)}&theme=${encodeURIComponent(themeMode.theme)}`;

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
          alt={ad.title}
          className="block h-full w-full object-contain"
          onError={() => setFailedSrc(img)}
        />
      </a>
    </div>
  );
}
