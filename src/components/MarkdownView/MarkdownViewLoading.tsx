'use client';

import { useTranslations } from 'next-intl';
import LoadingBlock from '@/components/ui/LoadingBlock';

export interface MarkdownViewLoadingProps {
  /** 预留高度，默认 240px；已知正文大致高度时传入更贴近的值。 */
  height?: number | string;
}

/**
 * `MarkdownView` 的 `dynamic()` 默认加载占位。
 *
 * `dynamic(() => import('@/components/MarkdownView'))` 不传 `loading` 时 fallback 是
 * `null`，客户端路由切换时正文区会直接塌成 0px。调用方应写成：
 *
 * ```tsx
 * const MarkdownView = dynamic(() => import('@/components/MarkdownView'), {
 *   loading: () => <MarkdownViewLoading />,
 * });
 * ```
 *
 * 单独成文件是为了不把 `MarkdownView` 本体拽进静态依赖图 —— 那会让 `dynamic()` 失去意义。
 */
export function MarkdownViewLoading({
  height = 240,
}: MarkdownViewLoadingProps) {
  const t = useTranslations('components.loading');

  return <LoadingBlock height={height} label={t('default')} />;
}

export default MarkdownViewLoading;
