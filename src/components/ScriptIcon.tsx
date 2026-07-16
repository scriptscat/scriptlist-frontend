'use client';

import { useState } from 'react';
import { ScriptUtils } from '@/app/[locale]/(main)/script-show-page/[id]/utils';
import type { ScriptIconSource } from '@/app/[locale]/(main)/script-show-page/[id]/utils';
import type { ReactNode } from 'react';

const iconPalette = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#0d6efd',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#0891b2',
];

export function pickIconColor(id: number): string {
  return iconPalette[Math.abs(id) % iconPalette.length];
}

function firstChar(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const ch = trimmed.charAt(0);
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch;
}

interface ScriptIconProps {
  script: ScriptIconSource;
  /** 兜底首字母的来源。详情页的标题与 script.name 可能不同，故单独传。 */
  name: string;
  size: number;
  radius?: number;
  textSize?: string;
  /** 覆盖默认的首字母色块兜底。ScriptListCard 用它保留排名 Tag。 */
  fallback?: ReactNode;
  className?: string;
}

/**
 * 脚本图标。图标经后端代理由 scriptcat.org 提供；加载失败（后端确认坏图会
 * 返回 404）时回退到首字母色块，不会出现浏览器裂图。
 */
export default function ScriptIcon({
  script,
  name,
  size,
  radius = 6,
  textSize = 'text-sm',
  fallback,
  className = '',
}: ScriptIconProps) {
  const [hasError, setHasError] = useState(false);
  const iconUrl = ScriptUtils.icon(script);

  if (iconUrl && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        src={iconUrl}
        width={size}
        height={size}
        loading="lazy"
        className={`flex-shrink-0 object-cover ${className}`}
        style={{ borderRadius: radius }}
        onError={() => setHasError(true)}
      />
    );
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return (
    <div
      style={{
        background: pickIconColor(script.id),
        width: size,
        height: size,
        borderRadius: radius,
      }}
      className={`flex-shrink-0 flex items-center justify-center text-white font-bold leading-none ${textSize} ${className}`}
    >
      {firstChar(name)}
    </div>
  );
}
