'use client';

import { useEffect, useRef } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type {
  DiffOnMount,
  Monaco,
  MonacoDiffEditor,
} from '@monaco-editor/react';
import type { editor as MonacoEditorNS } from 'monaco-editor';
import { useTheme } from '@/contexts/ThemeClientContext';
import type { MatchSegment } from '@/lib/api/services/similarity';

interface Props {
  codeA: string;
  codeB: string;
  segments: MatchSegment[];
}

interface MountState {
  editor: MonacoDiffEditor;
  monaco: Monaco;
}

function byteOffsetToLine(code: string, byteOffset: number): number {
  let line = 1;
  for (let i = 0; i < byteOffset && i < code.length; i++) {
    if (code.charCodeAt(i) === 10) line++;
  }
  return line;
}

export default function CodeDiffViewer({ codeA, codeB, segments }: Props) {
  const { themeMode } = useTheme();
  const mountRef = useRef<MountState | null>(null);
  const decorationsRef = useRef<{
    a: MonacoEditorNS.IEditorDecorationsCollection | null;
    b: MonacoEditorNS.IEditorDecorationsCollection | null;
  }>({ a: null, b: null });

  const applyDecorations = () => {
    const state = mountRef.current;
    if (!state) return;
    const { editor, monaco } = state;
    const orig = editor.getOriginalEditor();
    const mod = editor.getModifiedEditor();

    decorationsRef.current.a?.clear();
    decorationsRef.current.b?.clear();

    if (!segments.length) {
      decorationsRef.current = { a: null, b: null };
      return;
    }

    const aDecos = segments.map((s) => ({
      range: new monaco.Range(
        byteOffsetToLine(codeA, s.a_start),
        1,
        byteOffsetToLine(codeA, s.a_end),
        1,
      ),
      options: {
        isWholeLine: true,
        className: 'bg-yellow-100 dark:bg-yellow-800/30',
      },
    }));
    const bDecos = segments.map((s) => ({
      range: new monaco.Range(
        byteOffsetToLine(codeB, s.b_start),
        1,
        byteOffsetToLine(codeB, s.b_end),
        1,
      ),
      options: {
        isWholeLine: true,
        className: 'bg-yellow-100 dark:bg-yellow-800/30',
      },
    }));

    decorationsRef.current = {
      a: orig.createDecorationsCollection(aDecos),
      b: mod.createDecorationsCollection(bDecos),
    };
  };

  const onMount: DiffOnMount = (editor, monaco) => {
    mountRef.current = { editor, monaco };
    applyDecorations();
  };

  useEffect(() => {
    applyDecorations();
  }, [codeA, codeB, segments]);

  return (
    <DiffEditor
      height="600px"
      language="javascript"
      original={codeA}
      modified={codeB}
      theme={themeMode.theme === 'dark' ? 'vs-dark' : 'vs'}
      options={{
        readOnly: true,
        renderSideBySide: true,
        automaticLayout: true,
        minimap: { enabled: false },
      }}
      onMount={onMount}
    />
  );
}
