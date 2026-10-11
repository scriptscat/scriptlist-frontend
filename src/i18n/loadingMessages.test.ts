import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const LOCALES = [
  'zh-CN',
  'zh-TW',
  'en-US',
  'ja-JP',
  'ru-RU',
  'de-DE',
  'vi-VN',
] as const;

/** 共享加载态组件用到的文案，四个业务域都会引用，必须 7 语种齐备。 */
const LOADING_KEYS = [
  'default',
  'code',
  'chart',
  'failed',
  'retry',
  'redirecting',
] as const;

function messages(locale: string): Record<string, any> {
  const file = fileURLToPath(
    new URL(
      `../../public/locales/${locale}/translations.json`,
      import.meta.url,
    ),
  );
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

describe('components.loading 文案', () => {
  const byLocale = Object.fromEntries(
    LOCALES.map((locale) => [locale, messages(locale)]),
  );

  it.each(LOCALES)('%s 提供全部 loading 文案', (locale) => {
    const loading = byLocale[locale].components?.loading;

    expect(loading).toBeTypeOf('object');
    for (const key of LOADING_KEYS) {
      expect(loading[key], `${locale}.components.loading.${key}`).toBeTypeOf(
        'string',
      );
      expect(loading[key].trim().length).toBeGreaterThan(0);
    }
  });

  it.each(LOCALES.filter((l) => l !== 'en-US'))(
    '%s 不是英文占位（本项目没有 Crowdin，必须直接翻译）',
    (locale) => {
      const en = byLocale['en-US'].components.loading;
      const loading = byLocale[locale].components.loading;

      for (const key of LOADING_KEYS) {
        expect(
          loading[key],
          `${locale}.components.loading.${key} 与 en-US 相同`,
        ).not.toBe(en[key]);
      }
    },
  );

  it('编辑器加载文案复用既有的 markdown_editor.loading_editor', () => {
    for (const locale of LOCALES) {
      expect(
        byLocale[locale].components.markdown_editor.loading_editor,
      ).toBeTypeOf('string');
      // 不新增 components.loading.editor，避免同义重复的键
      expect(byLocale[locale].components.loading.editor).toBeUndefined();
    }
  });
});
