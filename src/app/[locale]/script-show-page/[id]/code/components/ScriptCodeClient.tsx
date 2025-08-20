'use client';

import { Card } from 'antd';
import React from 'react';
import { useTranslations } from 'next-intl';
import MonacoEditor from '@/components/MonacoEditor';
import type { ScriptInfo } from '../../types';

type ScriptCodeClientProps = {
  script: ScriptInfo;
};

export default function ScriptCodeClient({ script }: ScriptCodeClientProps) {
  const t = useTranslations();

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
