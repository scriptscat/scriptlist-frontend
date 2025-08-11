import { ReactNode } from 'react';
import { scriptService } from '@/lib/api/services/scripts';
import { ScriptSettingProvider } from '@/contexts/ScriptSettingContext';
import ManageClientLayout from './components/ManageClientLayout';

interface ManageLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string; locale: string }>;
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
