import type { ReactNode } from 'react';
import { scriptService } from '@/lib/api/services/scripts';
import { ScriptSettingProvider } from '@/contexts/ScriptSettingContext';
import ManageClientLayout from './components/ManageClientLayout';
import { generateScriptMetadata } from '../metadata';
import type { Metadata } from 'next';
import type { ScriptDetailPageProps } from '../types';
import { PageIntlProvider } from '@/components/PageIntlProvider';
import { noindexRobots } from '@/lib/seo/robots';

interface ManageLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: ScriptDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const metadata = await generateScriptMetadata(id, 'manage', locale);
  return { ...metadata, robots: noindexRobots };
}

export default async function ManageLayout({
  children,
  params,
}: ManageLayoutProps) {
  // 等待 params Promise 解析
  const { id } = await params;
  const scriptSetting = await scriptService.getSettingCached(Number(id));

  return (
    <PageIntlProvider namespaces={['script', 'admin']}>
      <ScriptSettingProvider scriptSetting={scriptSetting}>
        <ManageClientLayout scriptId={id}>{children}</ManageClientLayout>
      </ScriptSettingProvider>
    </PageIntlProvider>
  );
}
