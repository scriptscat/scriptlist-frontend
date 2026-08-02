import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const localeDirectories = [
  'en-US',
  'zh-CN',
  'zh-TW',
  'ru-RU',
  'ja-JP',
  'de-DE',
];
const gmCookieSignals = [
  'gm_cookie_unrecognized_usage',
  'gm_cookie_unused_sensitive_permission',
  'gm_cookie_data_exfiltration',
  'gm_cookie_data_injection',
  'gm_cookie_analysis_incomplete',
];

describe('similarity signal translations', () => {
  it.each(localeDirectories)(
    'defines every GM_cookie signal for %s',
    (locale) => {
      const translations = JSON.parse(
        readFileSync(
          resolve('public', 'locales', locale, 'translations.json'),
          'utf8',
        ),
      ) as {
        admin: { similarity: { signal_desc: Record<string, string> } };
      };

      for (const signal of gmCookieSignals) {
        expect(translations.admin.similarity.signal_desc[signal]).toBeTruthy();
      }
    },
  );
});
