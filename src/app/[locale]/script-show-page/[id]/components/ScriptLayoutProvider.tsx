'use client';

import { usePathname } from 'next/navigation';
import type { ScriptInfo, ScriptState } from '../types';
import ScriptLayout from './ScriptLayout';
import { ScriptProvider } from './ScriptContext';

interface ScriptLayoutProviderProps {
  children: React.ReactNode;
  script: ScriptInfo;
  scriptState?: ScriptState;
}

export default function ScriptLayoutProvider({
  children,
  script,
  scriptState,
}: ScriptLayoutProviderProps) {
  const pathname = usePathname();

  // 从路径确定当前激活的标签
  const getActiveTab = (pathname: string) => {
    if (pathname.includes('/code')) return 'code';
    if (pathname.includes('/issue')) return 'issue';
    if (pathname.includes('/statistic')) return 'statistic';
    if (pathname.includes('/version')) return 'version';
    if (pathname.includes('/update')) return 'update';
    if (pathname.includes('/manage')) return 'manage';
    if (pathname.includes('/comment')) return 'comment';
    return 'overview';
  };

  const activeTab = getActiveTab(pathname);

  return (
    <ScriptProvider script={script} scriptState={scriptState}>
      <ScriptLayout script={script} activeTab={activeTab}>
        {children}
      </ScriptLayout>
    </ScriptProvider>
  );
}
