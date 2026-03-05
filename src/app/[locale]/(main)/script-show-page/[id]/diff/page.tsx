import type { Metadata, ResolvingMetadata } from 'next';
import type { ScriptDetailPageProps } from '../types';
import type { ScriptInfo } from '../types';
import ScriptDiffClient from './components/ScriptDiffClient';
import { generateScriptMetadata } from '../metadata';
import scriptService from '@/lib/api/services/scripts';

export default async function ScriptDiffPage({
  params,
  searchParams,
}: ScriptDetailPageProps & {
  searchParams: Promise<{
    version1?: string;
    version2?: string;
    id2?: string;
  }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  let { version1, version2 } = resolvedSearchParams;
  const { id2 } = resolvedSearchParams;

  if (!version1) {
    throw new Error('Missing version1 parameter');
  }

  let script1: ScriptInfo;
  let script2: ScriptInfo;

  if (id2) {
    // 跨脚本对比
    if (version2) {
      // id2和version2都存在，获取指定版本
      [script1, script2] = await Promise.all([
        scriptService.getVersionCodeCached(id, version1),
        scriptService.getVersionCodeCached(id2, version2),
      ]);
    } else {
      // id2存在但version2不存在，获取id2的最新脚本
      [script1, script2] = await Promise.all([
        scriptService.getVersionCodeCached(id, version1),
        scriptService.code(id2),
      ]);
    }
  } else {
    // 同一脚本的不同版本对比
    if (!version2) {
      throw new Error('Missing version2 parameter for same script comparison');
    }
    [script1, script2] = await Promise.all([
      scriptService.getVersionCodeCached(id, version1),
      scriptService.getVersionCodeCached(id, version2),
    ]);
    // 如果脚本1大于脚本2，则交换两个脚本
    if (script1.script.id > script2.script.id) {
      const temp = script1;
      script1 = script2;
      script2 = temp;
      const tempVersion = version1;
      version1 = version2;
      version2 = tempVersion;
    }
  }

  return (
    <ScriptDiffClient
      script1={script1}
      script2={script2}
      version1={version1}
      version2={version2}
      id2={id2}
    />
  );
}

export async function generateMetadata(
  {
    params,
    searchParams,
  }: ScriptDetailPageProps & {
    searchParams: Promise<{
      version1?: string;
      version2?: string;
    }>;
  },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id, locale } = await params;
  const { version1, version2 } = await searchParams;
  return generateScriptMetadata(id, 'diff', locale, {
    version1,
    version2,
  });
}
