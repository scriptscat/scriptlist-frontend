import type { Metadata } from 'next';
import { generateScriptMetadata } from '../../metadata';
import type { ScriptDetailPageProps } from '../../types';
import CreateReportClient from './CreateReportClient';

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'report', locale);
}

export default function CreateReport() {
  return <CreateReportClient />;
}
