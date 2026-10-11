import type { LocalizedSummary } from '@/types/api';

export function selectLocalizedSummary(
  summary: LocalizedSummary,
  locale: string,
): string {
  return locale === 'zh' || locale.startsWith('zh-') ? summary.zh : summary.en;
}
