import type { Metadata, ResolvingMetadata } from 'next';
import type { ScriptDetailPageProps, ScriptInfo } from '../types';
import ScriptCodeClient from './components/ScriptCodeClient';
import { generateScriptMetadata } from '../metadata';
import scriptService from '@/lib/api/services/scripts';

export default async function ScriptCodePage({
  params,
  searchParams,
}: ScriptDetailPageProps & {
  searchParams: Promise<{
    version?: string;
  }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  let script: ScriptInfo;
  if (resolvedSearchParams?.version) {
    script = await scriptService.getVersionCodeCached(
      id,
      resolvedSearchParams.version,
    );
  } else {
    script = await scriptService.code(id);
  }
  return <ScriptCodeClient script={script} />;
}

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'code', locale);
}
