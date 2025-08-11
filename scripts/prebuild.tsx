import React from 'react';
import fs from 'fs';
import { ConfigProvider, theme } from 'antd';
import { extractStyle } from '@ant-design/static-style-extract';

const outputPath = './public/styles/antd.min.css';

const css = extractStyle((node) => (
  <>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      {node}
    </ConfigProvider>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      {node}
    </ConfigProvider>
  </>
));

// 创建目录
fs.mkdirSync('./public/styles', { recursive: true });
// 生成css
fs.writeFileSync(outputPath, css);

// 拷贝monaco
fs.cpSync(
  './node_modules/monaco-editor/min/vs',
  './public/assets/monaco-editor/min/vs',
  { recursive: true },
);
