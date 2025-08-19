import { scriptService } from '@/lib/api/services/scripts';
import type { Metadata } from 'next';
import { ScriptUtils } from './utils';

/**
 * 页面后缀配置
 */
export const PAGE_SUFFIXES = {
  detail: { title: '', description: '' },
  code: { title: '代码', description: '查看{name}的源代码' },
  comment: { title: '评分', description: '查看{name}的评分' },
  stats: { title: '脚本统计', description: '查看{name}的安装统计和使用数据' },
  version: { title: '版本列表', description: '查看{name}的所有版本历史' },
  issue: { title: '反馈', description: '查看{name}的问题反馈' },
  manage: { title: '脚本管理', description: '管理{name}脚本' },
  update: { title: '更新脚本', description: '更新{name}脚本' },
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
): Promise<Metadata> {
  try {
    // 获取脚本信息 - 使用缓存版本避免重复请求
    const script = await scriptService.infoCached(scriptId);
    const suffix = PAGE_SUFFIXES[pageType];
    const scriptName = ScriptUtils.i18nName(script, locale);
    const scriptDescription = ScriptUtils.i18nDescription(script, locale);

    // 构建标题和描述
    const title = suffix.title ? `${scriptName} - ${suffix.title}` : scriptName;
    const description = suffix.description
      ? suffix.description.replace('{name}', scriptName)
      : scriptDescription;

    return {
      title: title + ' | ScriptCat',
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
    };
  } catch (error) {
    // 如果获取脚本信息失败，返回默认元数据
    const suffix = PAGE_SUFFIXES[pageType];
    const fallbackTitle = suffix.title || '脚本详情';
    const fallbackDescription = suffix.title
      ? `查看脚本${suffix.title}`
      : '查看脚本详细信息';

    return {
      title: fallbackTitle + ' | ScriptCat',
      description: fallbackDescription,
    };
  }
}
