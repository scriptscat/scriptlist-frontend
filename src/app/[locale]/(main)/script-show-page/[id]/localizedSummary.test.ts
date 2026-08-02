import { describe, expect, it } from 'vitest';
import { selectLocalizedSummary } from './localizedSummary';

const summary = { zh: '中文摘要', en: 'English summary' };

describe('selectLocalizedSummary', () => {
  it.each(['zh', 'zh-CN', 'zh-TW'])('selects Chinese for %s', (locale) => {
    expect(selectLocalizedSummary(summary, locale)).toBe('中文摘要');
  });

  it.each(['en', 'ja', 'ru', 'de'])('selects English for %s', (locale) => {
    expect(selectLocalizedSummary(summary, locale)).toBe('English summary');
  });
});
