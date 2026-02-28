import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from '../types';
import ScriptVersionsClient from './components/ScriptVersionsClient';
import { generateScriptMetadata } from '../metadata';
import { scriptService } from '@/lib/api/services/scripts';
import { notFound } from 'next/navigation';

export default async function ScriptVersionsPage({
  params,
}: ScriptDetailPageProps) {
  const { id } = await params;
  const scriptId = parseInt(id);

  if (isNaN(scriptId)) {
    notFound();
  }

  let versionListData;
  let versionStatData;
  try {
    [versionListData, versionStatData] = await Promise.all([
      scriptService.getVersionListCached(scriptId, { page: 1, size: 10 }),
      scriptService.getVersionStatCached(scriptId),
    ]);
  } catch (error) {
    console.error('Failed to fetch version data:', error);
    notFound();
  }

  return (
    <ScriptVersionsClient
      initialVersionData={versionListData}
      versionStat={versionStatData}
      initialPage={1}
      initialPageSize={10}
    />
  );
}

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'version', locale);
}
