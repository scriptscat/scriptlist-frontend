'use client';

import Editor from '@monaco-editor/react';
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

const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(({
  value,
  language = 'javascript',
  readOnly = true,
  height = '400px',
  className = '',
  onChange,
}, ref) => {
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
        beforeMount={(monaco) => {
          // Configure Monaco Editor to use local assets
          (self as any).MonacoEnvironment = {
            getWorkerUrl: function (moduleId: string, label: string) {
              if (label === 'json') {
                return '/assets/monaco-editor/min/vs/language/json/json.worker.js';
              }
              if (label === 'css' || label === 'scss' || label === 'less') {
                return '/assets/monaco-editor/min/vs/language/css/css.worker.js';
              }
              if (
                label === 'html' ||
                label === 'handlebars' ||
                label === 'razor'
              ) {
                return '/assets/monaco-editor/min/vs/language/html/html.worker.js';
              }
              if (label === 'typescript' || label === 'javascript') {
                return '/assets/monaco-editor/min/vs/language/typescript/ts.worker.js';
              }
              return '/assets/monaco-editor/min/vs/editor/editor.worker.js';
            },
          };
        }}
      />
    </div>
  );
});

MonacoEditor.displayName = 'MonacoEditor';

export default MonacoEditor;
