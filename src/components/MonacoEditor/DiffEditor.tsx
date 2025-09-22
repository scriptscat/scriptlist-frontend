'use client';

import { DiffEditor, loader } from '@monaco-editor/react';
import { useTheme } from '@/contexts/ThemeClientContext';

interface MonacoDiffEditorProps {
  original: string;
  modified: string;
  language?: string;
  height?: string | number;
  className?: string;
}

loader.config({
  paths: {
    vs: '/assets/monaco-editor/min/vs',
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

  return (
    <div className={className}>
      <DiffEditor
        height={height}
        language={language}
        original={original}
        modified={modified}
        theme={themeMode.theme === 'dark' ? 'vs-dark' : 'vs'}
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