'use client';

import { Button, Card, Space, Typography, message } from 'antd';
import React from 'react';
import {
  CodeOutlined,
  CopyOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MonacoEditor from '@/components/MonacoEditor';
import { useScript } from '../../components/ScriptContext';
import { ScriptInfo } from '../../types';

const { Title } = Typography;

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
