import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from './types';
import ScriptDetailClient from './components/ScriptDetailClient';
import { generateScriptMetadata } from './metadata';
import scriptService from '@/lib/api/services/scripts';

export default async function ScriptDetailPage({
  params,
}: ScriptDetailPageProps) {
  const { id } = await params;
  // Fetch content separately - React.cache deduplicates with layout's call
  const script = await scriptService.infoCached(id);
  return <ScriptDetailClient content={script.content} />;
}

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'detail', locale);
}
