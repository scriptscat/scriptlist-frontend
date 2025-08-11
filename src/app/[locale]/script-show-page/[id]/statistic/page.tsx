import type { Metadata, ResolvingMetadata } from 'next';
import type { ScriptDetailPageProps } from '../types';
import ScriptStatsClient from './components/ScriptStatsClient';
import { generateScriptMetadata } from '../metadata';

export default function ScriptStatsPage() {
  return <ScriptStatsClient />;
}

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return generateScriptMetadata(id, 'stats');
}
