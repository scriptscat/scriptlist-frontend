'use client';

import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useTheme } from '@/contexts/ThemeClientContext';
import { forwardRef, useImperativeHandle, useRef } from 'react';

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
    vs: '/assets/monaco-editor/min/vs',
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
