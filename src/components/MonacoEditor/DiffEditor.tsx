'use client';

import { DiffEditor, loader } from '@monaco-editor/react';
import { useTheme } from '@/contexts/ThemeClientContext';
import { useTranslations } from 'next-intl';
import LoadingBlock from '@/components/ui/LoadingBlock';
import { MONACO_ASSET_ROOT } from './config';

interface MonacoDiffEditorProps {
  original: string;
  modified: string;
  language?: string;
  height?: string | number;
  className?: string;
}

loader.config({
  paths: {
    vs: MONACO_ASSET_ROOT,
  },
});

export default function MonacoDiffEditor({
  original,
  modified,
  language = 'javascript',
  height = '600px',
  className = '',
}: MonacoDiffEditorProps) {
  const { themeMode } = useTheme();
  const t = useTranslations('components.loading');

  return (
    <div className={className}>
      <DiffEditor
        height={height}
        language={language}
        original={original}
        modified={modified}
        theme={themeMode.theme === 'dark' ? 'vs-dark' : 'vs'}
        // 不传 loading 会落到 @monaco-editor/react 内置的英文 "Loading..."
        loading={
          <LoadingBlock
            height="100%"
            variant="spinner"
            label={t('code')}
            className="w-full"
          />
        }
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          renderSideBySide: true,
        }}
      />
    </div>
  );
}
