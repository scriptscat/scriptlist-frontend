import { scriptService } from '@/lib/api/services/scripts';
import type { Metadata } from 'next';
import { ScriptUtils } from './utils';
import { getTranslations } from 'next-intl/server';

/**
 * 页面后缀配置
 */
export const PAGE_SUFFIXES = {
  detail: { title: '', description: '' },
  code: { title: 'code', description: 'code' },
  comment: { title: 'comment', description: 'comment' },
  stats: { title: 'stats', description: 'stats' },
  version: { title: 'version', description: 'version' },
  issue: { title: 'issue', description: 'issue' },
  manage: { title: 'manage', description: 'manage' },
  update: { title: 'update', description: 'update' },
  diff: { title: 'code', description: 'code' },
} as const;

export type PageType = keyof typeof PAGE_SUFFIXES;

/**
 * 生成脚本页面的元数据
 * @param scriptId 脚本ID
 * @param pageType 页面类型
 * @returns 元数据对象
 */
export async function generateScriptMetadata(
  scriptId: string,
  pageType: PageType,
  locale: string,
  params?: {
    version?: string;
    version1?: string;
    version2?: string;
  },
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'script.metadata' });

  try {
    // 获取脚本信息 - 使用缓存版本避免重复请求
    const script = await scriptService.infoCached(scriptId);
    const suffix = PAGE_SUFFIXES[pageType];
    const scriptName = ScriptUtils.i18nName(script, locale);
    const scriptDescription = ScriptUtils.i18nDescription(script, locale);

    // 构建标题和描述
    let title = suffix.title
      ? `${scriptName} - ${t(`page_suffixes.${suffix.title}.title`)}`
      : scriptName;
    const description = suffix.description
      ? t(`page_suffixes.${suffix.description}.description`, {
          name: scriptName,
        })
      : scriptDescription;
    if (params?.version) {
      title += ` - v${params.version}`;
    }
    if (params?.version1 && params?.version2) {
      title += ` - v${params.version1} vs v${params.version2}`;
    }
    return {
      title: title + ' | ScriptCat',
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
    };
  } catch {
    // 如果获取脚本信息失败，返回默认元数据
    const suffix = PAGE_SUFFIXES[pageType];
    const fallbackTitle = suffix.title
      ? t(`page_suffixes.${suffix.title}.title`)
      : t('fallback.title');
    const fallbackDescription = suffix.title
      ? t('fallback.description_with_suffix', {
          suffix: t(`page_suffixes.${suffix.title}.title`),
        })
      : t('fallback.description_default');

    return {
      title: fallbackTitle + ' | ScriptCat',
      description: fallbackDescription,
    };
  }
}
