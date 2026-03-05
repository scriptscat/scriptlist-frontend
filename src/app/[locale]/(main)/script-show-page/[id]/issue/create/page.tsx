import type { Metadata } from 'next';
import { generateScriptMetadata } from '../../metadata';
import type { ScriptDetailPageProps } from '../../types';
import CreateIssueClient from './CreateIssueClient';

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'issue', locale);
}

export default function Create() {
  return <CreateIssueClient />;
}
