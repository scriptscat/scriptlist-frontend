import type { Metadata, ResolvingMetadata } from 'next';
import type { ScriptDetailPageProps } from './types';
import ScriptDetailClient from './components/ScriptDetailClient';
import { generateScriptMetadata } from './metadata';

export default function ScriptDetailPage() {
  return <ScriptDetailClient />;
}

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return generateScriptMetadata(id, 'detail');
}
