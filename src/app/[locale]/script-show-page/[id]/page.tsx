import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from './types';
import ScriptDetailClient from './components/ScriptDetailClient';
import { generateScriptMetadata } from './metadata';

export default function ScriptDetailPage() {
  return <ScriptDetailClient />;
}

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'detail', locale);
}
