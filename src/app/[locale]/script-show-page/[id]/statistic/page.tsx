import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from '../types';
import ScriptStatsClient from './components/ScriptStatsClient';
import { generateScriptMetadata } from '../metadata';

export default function ScriptStatsPage() {
  return <ScriptStatsClient />;
}

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'stats', locale);
}
