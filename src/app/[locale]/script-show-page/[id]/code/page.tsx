import { Metadata, ResolvingMetadata } from 'next';
import { ScriptDetailPageProps, ScriptInfo } from '../types';
import ScriptCodeClient from './components/ScriptCodeClient';
import { generateScriptMetadata } from '../metadata';
import scriptService from '@/lib/api/services/scripts';

export default async function ScriptCodePage({
  params,
  searchParams,
}: ScriptDetailPageProps) {
  const { id } = await params;
  let script: ScriptInfo;
  if (searchParams?.version) {
    script = await scriptService.getVersionCodeCached(id, searchParams.version);
  } else {
    script = await scriptService.code(id);
  }
  return <ScriptCodeClient script={script} />;
}

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return generateScriptMetadata(id, 'code');
}
