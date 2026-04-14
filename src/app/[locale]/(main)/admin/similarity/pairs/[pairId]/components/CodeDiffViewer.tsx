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

// Backend match-segment offsets are UTF-8 byte offsets, but JS string indices
// are UTF-16 code units. Build a sorted list of (byteOffset, line) pairs from
// the encoded source so each segment endpoint maps to the correct line.
function buildByteToLineIndex(code: string): number[] {
  const bytes = new TextEncoder().encode(code);
  const newlineByteOffsets: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 10) newlineByteOffsets.push(i);
  }
  return newlineByteOffsets;
}

function byteOffsetToLine(
  newlineByteOffsets: number[],
  byteOffset: number,
): number {
  let lo = 0;
  let hi = newlineByteOffsets.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (newlineByteOffsets[mid] < byteOffset) lo = mid + 1;
    else hi = mid;
  }
  return lo + 1;
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

    const aIndex = buildByteToLineIndex(codeA);
    const bIndex = buildByteToLineIndex(codeB);

    const aDecos = segments.map((s) => ({
      range: new monaco.Range(
        byteOffsetToLine(aIndex, s.a_start),
        1,
        byteOffsetToLine(aIndex, s.a_end),
        1,
      ),
      options: {
        isWholeLine: true,
        className: 'similarity-match-highlight',
      },
    }));
    const bDecos = segments.map((s) => ({
      range: new monaco.Range(
        byteOffsetToLine(bIndex, s.b_start),
        1,
        byteOffsetToLine(bIndex, s.b_end),
        1,
      ),
      options: {
        isWholeLine: true,
        className: 'similarity-match-highlight',
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
