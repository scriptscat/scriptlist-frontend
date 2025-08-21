'use client';

import { Card } from 'antd';
import React from 'react';
import MonacoEditor from '@/components/MonacoEditor';
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
