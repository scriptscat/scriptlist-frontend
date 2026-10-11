'use client';

import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from '@/contexts/ThemeClientContext';
import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import LoadingBlock from '@/components/ui/LoadingBlock';
import { MONACO_ASSET_ROOT } from './config';

interface MonacoEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  className?: string;
  onChange?: (value: string | undefined) => void;
}

export interface MonacoEditorRef {
  getValue: () => string | undefined;
  setValue: (value: string) => void;
}

loader.config({
  paths: {
    vs: MONACO_ASSET_ROOT,
  },
});

const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  (
    {
      value,
      language = 'javascript',
      readOnly = true,
      height = '400px',
      className = '',
      onChange,
    },
    ref,
  ) => {
    const { themeMode } = useTheme();
    const t = useTranslations('components.loading');
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue(),
      setValue: (value: string) => editorRef.current?.setValue(value),
    }));

    return (
      <div className={className}>
        <Editor
          height={height}
          language={language}
          value={value}
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
          onChange={onChange}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            readOnly,
            minimap: { enabled: !readOnly },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    );
  },
);

MonacoEditor.displayName = 'MonacoEditor';

export default MonacoEditor;
