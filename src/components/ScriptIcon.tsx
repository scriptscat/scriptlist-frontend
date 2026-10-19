'use client';

import { useCallback, useState } from 'react';
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
 *
 * 降级链是 thumbnail → original → 首字母色块。
 *
 * ⚠️ 必须在水合时补一次检查（见下方 callback ref）：SSR 渲染出的 <img> 往往在
 * React 于客户端挂上监听之前就已经加载失败了（例如后端对 SVG/WebP 返回
 * 404，响应只有 282 字节，比 hydration 快得多）。那时浏览器派发的 error
 * 事件没有任何监听者，等 React 挂上 onError 时事件早过去了 —— 表现为
 * complete=true、naturalWidth=0，src 却停在缩略图上，用户看到裂图而不是
 * 兜底。线上 711、4107 的 SVG 图标就是这个现象。
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
  const [iconSource, setIconSource] = useState<
    'thumbnail' | 'original' | 'fallback'
  >('thumbnail');

  const advance = useCallback(() => {
    setIconSource((source) =>
      source === 'thumbnail'
        ? 'original'
        : source === 'original'
          ? 'fallback'
          : source,
    );
  }, []);

  // 水合补偿：callback ref 在 DOM 挂载的 commit 阶段就跑，早于任何 effect，
  // 正是检查「是不是在我挂上监听之前就失败了」的正确时机。
  // 每次 iconSource 变化都会换一个 ref 回调，新挂载的 <img> 会再被检查一次，
  // 所以第二跳（原图）同样不会漏。
  const checkHydration = useCallback(
    (img: HTMLImageElement | null) => {
      // complete 且 naturalWidth 为 0：浏览器已尝试加载并失败，而那次
      // error 事件发生时我们还没挂上监听。
      if (img?.complete && img.naturalWidth === 0) {
        advance();
      }
    },
    [advance],
  );

  const iconUrl =
    iconSource === 'thumbnail'
      ? ScriptUtils.icon(script, size)
      : iconSource === 'original'
        ? ScriptUtils.iconOriginal(script)
        : null;

  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        key={iconUrl}
        ref={checkHydration}
        src={iconUrl}
        width={size}
        height={size}
        loading="lazy"
        className={`flex-shrink-0 object-cover ${className}`}
        style={{ borderRadius: radius }}
        onError={advance}
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
