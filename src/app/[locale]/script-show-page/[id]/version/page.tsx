import { Metadata, ResolvingMetadata } from 'next';
import { ScriptDetailPageProps } from '../types';
import ScriptVersionsClient from './components/ScriptVersionsClient';
import { generateScriptMetadata } from '../metadata';
import { scriptService } from '@/lib/api/services/scripts';
import { notFound } from 'next/navigation';

export default async function ScriptVersionsPage({ params }: ScriptDetailPageProps) {
  const { id } = await params;
  const scriptId = parseInt(id);

  if (isNaN(scriptId)) {
    notFound();
  }

  try {
    // 并行获取版本列表数据和统计数据
    const [versionListData, versionStatData] = await Promise.all([
      scriptService.getVersionListCached(scriptId, { page: 1, size: 10 }),
      scriptService.getVersionStatCached(scriptId),
    ]);

    return (
      <ScriptVersionsClient 
        initialVersionData={versionListData}
        versionStat={versionStatData}
        initialPage={1}
        initialPageSize={10}
      />
    );
  } catch (error) {
    console.error('Failed to fetch version data:', error);
    notFound();
  }
}

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return generateScriptMetadata(id, 'version');
}
