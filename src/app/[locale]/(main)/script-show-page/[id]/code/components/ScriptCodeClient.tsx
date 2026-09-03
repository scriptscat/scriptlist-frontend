'use client';

import { Card } from 'antd';
import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import CodeSkeleton from './CodeSkeleton';

/**
 * Monaco 的加载占位。
 *
 * 原来是 `<div style={{ height: '600px' }} />`：高度留住了，但屏幕上是一块
 * 什么都没有的空白，用户分不清是在加载还是加载失败。
 */
function MonacoLoading() {
  const t = useTranslations('components.loading');
  return <CodeSkeleton height={600} label={t('code')} />;
}

const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), {
  ssr: false,
  loading: () => <MonacoLoading />,
});
import type { ScriptInfo } from '../../types';

type ScriptCodeClientProps = {
  script: ScriptInfo;
};

export default function ScriptCodeClient({ script }: ScriptCodeClientProps) {
  return (
    <Card className="shadow-sm">
      <MonacoEditor
        value={script.script.code}
        language="javascript"
        height="600px"
        readOnly={true}
      />
    </Card>
  );
}
