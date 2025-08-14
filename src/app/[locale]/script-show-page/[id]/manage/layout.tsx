import type { ReactNode } from 'react';
import { scriptService } from '@/lib/api/services/scripts';
import { ScriptSettingProvider } from '@/contexts/ScriptSettingContext';
import ManageClientLayout from './components/ManageClientLayout';
import { generateScriptMetadata } from '../metadata';
import { ResolvingMetadata, Metadata } from 'next';
import { ScriptDetailPageProps } from '../types';

interface ManageLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata(
  { params }: ScriptDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return generateScriptMetadata(id, 'manage');
}

export default async function ManageLayout({
  children,
  params,
}: ManageLayoutProps) {
  // 等待 params Promise 解析
  const { id } = await params;
  const scriptSetting = await scriptService.getSettingCached(Number(id));

  return (
    <ScriptSettingProvider scriptSetting={scriptSetting}>
      <ManageClientLayout scriptId={id}>{children}</ManageClientLayout>
    </ScriptSettingProvider>
  );
}
