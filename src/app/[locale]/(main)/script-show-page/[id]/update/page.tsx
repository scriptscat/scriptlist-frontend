import React from 'react';
import ScriptUpdateWrapper from '@/components/ScriptEditor/ScriptUpdateWrapper';
import type { ScriptDetailPageProps } from '../types';
import { scriptService } from '@/lib/api/services/scripts';
import type { Metadata } from 'next';
import { generateScriptMetadata } from '../metadata';

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  return generateScriptMetadata(id, 'update', locale);
}

export default async function ScriptUpdatePage({
  params,
}: ScriptDetailPageProps) {
  const { id } = await params;
  const script = await scriptService.code(id);

  return <ScriptUpdateWrapper script={script} scriptId={id} />;
}
