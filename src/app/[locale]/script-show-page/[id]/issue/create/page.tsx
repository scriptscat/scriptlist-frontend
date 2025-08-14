import { ResolvingMetadata, Metadata } from 'next';
import { generateScriptMetadata } from '../../metadata';
import { ScriptDetailPageProps } from '../../types';
import CreateIssueClient from './CreateIssueClient';

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return generateScriptMetadata(id, 'issue');
}

export default function Create() {
  return <CreateIssueClient />;
}
