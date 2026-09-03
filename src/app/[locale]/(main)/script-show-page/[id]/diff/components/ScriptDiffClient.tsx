'use client';

import { Card, Tag, Divider, Alert } from 'antd';
import React from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import CodeSkeleton from '../../code/components/CodeSkeleton';

/**
 * Diff 编辑器的加载占位。
 *
 * 原来是 `<div style={{ height: '600px' }} />` —— 一块看不见的空洞。
 */
function DiffEditorLoading() {
  const tLoading = useTranslations('components.loading');
  return <CodeSkeleton height={600} label={tLoading('code')} />;
}

const MonacoDiffEditor = dynamic(
  () => import('@/components/MonacoEditor/DiffEditor'),
  { ssr: false, loading: () => <DiffEditorLoading /> },
);
import type { ScriptInfo } from '../../types';

type ScriptDiffClientProps = {
  script1: ScriptInfo;
  script2: ScriptInfo;
  version1: string;
  version2?: string;
  id2?: string;
};

export default function ScriptDiffClient({
  script1,
  script2,
  version1,
  version2,
  id2,
}: ScriptDiffClientProps) {
  const isCrossScript = Boolean(id2);
  const t = useTranslations('script.diff');

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isCrossScript ? t('cross_script_title') : t('code_title')}
          </h2>
          <div className="flex items-center gap-2">
            {isCrossScript ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-500">{script1.name}</div>
                  <Tag color="blue">
                    {'v'}
                    {version1}
                  </Tag>
                </div>
                <span className="mx-2">{'vs'}</span>
                <div className="flex flex-col items-center">
                  <div className="text-sm text-gray-500">{script2.name}</div>
                  <Tag color="green">
                    {'v'}
                    {version2}
                  </Tag>
                </div>
              </>
            ) : (
              <>
                <Tag color="blue">
                  {t('version_tag', { version: version1 })}
                </Tag>
                <span>{'vs'}</span>
                <Tag color="green">
                  {t('version_tag', { version: version2 ?? '' })}
                </Tag>
              </>
            )}
          </div>
        </div>
        {!isCrossScript && (
          <Alert
            message={t('compare_hint')}
            type="info"
            showIcon
            className="mb-4"
          />
        )}
        <Divider />
        <MonacoDiffEditor
          original={script1.script.code}
          modified={script2.script.code}
          language="javascript"
          height="600px"
        />
      </Card>
    </div>
  );
}
