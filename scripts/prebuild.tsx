import React from 'react';
import fs from 'fs';
import { extractStyle } from '@ant-design/static-style-extract';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';

const outputPath = './public/styles/antd.min.css';

const css = extractStyle((node) => (
  <>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <StyleProvider hashPriority="high">{node}</StyleProvider>
    </ConfigProvider>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <StyleProvider hashPriority="high">{node}</StyleProvider>
    </ConfigProvider>
  </>
));

// 创建目录
fs.mkdirSync('./public/styles', { recursive: true });
// 生成css
fs.writeFileSync(outputPath, css);

// 拷贝monoac
fs.cpSync(
  './node_modules/monaco-editor/min/vs',
  './public/assets/monaco-editor/min/vs',
  { recursive: true }
);
