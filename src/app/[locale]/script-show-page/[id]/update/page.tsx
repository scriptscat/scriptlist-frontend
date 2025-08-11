import React from 'react';
import ScriptUpdateWrapper from '@/components/ScriptEditor/ScriptUpdateWrapper';
import type { ScriptDetailPageProps } from '../types';
import { scriptService } from '@/lib/api/services/scripts';

export default async function ScriptUpdatePage({
  params,
}: ScriptDetailPageProps) {
  const { id } = await params;
  const script = await scriptService.code(id);

  return <ScriptUpdateWrapper script={script} scriptId={id} />;
}
