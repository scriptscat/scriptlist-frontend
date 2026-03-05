'use client';

import { Card } from 'antd';
import React from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), {
  ssr: false,
  loading: () => <div style={{ height: '600px' }} />,
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
