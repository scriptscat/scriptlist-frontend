import React from 'react';
import fs from 'fs';
import path from 'path';
import { ConfigProvider, theme } from 'antd';
import { extractStyle } from '@ant-design/static-style-extract';
import {
  lightToken,
  darkToken,
  getComponents,
  getCssVarConfig,
} from '../src/lib/antd-theme';

const outputPath = './public/styles/antd.min.css';

const css = extractStyle((node) => (
  <>
    <ConfigProvider
      theme={{
        cssVar: getCssVarConfig('light'),
        algorithm: theme.defaultAlgorithm,
        token: lightToken,
        components: getComponents('light'),
      }}
    >
      {node}
    </ConfigProvider>
    <ConfigProvider
      theme={{
        cssVar: getCssVarConfig('dark'),
        algorithm: theme.darkAlgorithm,
        token: darkToken,
        components: getComponents('dark'),
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

// 拷贝monaco - 只复制必要的文件，减少体积（14MB -> ~5MB）
const monacoSrc = './node_modules/monaco-editor/min/vs';
const monacoDst = './public/assets/monaco-editor/min/vs';

// 核心文件（必须）
fs.mkdirSync(monacoDst, { recursive: true });
fs.copyFileSync(path.join(monacoSrc, 'loader.js'), path.join(monacoDst, 'loader.js'));

// 中文语言包
const nlsFile = 'nls.messages.zh-cn.js';
if (fs.existsSync(path.join(monacoSrc, nlsFile))) {
  fs.copyFileSync(path.join(monacoSrc, nlsFile), path.join(monacoDst, nlsFile));
}

// base（核心运行时）和 editor（编辑器主体）
for (const dir of ['base', 'editor']) {
  fs.cpSync(path.join(monacoSrc, dir), path.join(monacoDst, dir), { recursive: true });
}

// language - 只复制 typescript 和 json（JS 由 typescript worker 处理）
for (const lang of ['typescript', 'json']) {
  fs.cpSync(
    path.join(monacoSrc, 'language', lang),
    path.join(monacoDst, 'language', lang),
    { recursive: true },
  );
}

// basic-languages - 只复制 javascript、typescript、css
for (const lang of ['javascript', 'typescript', 'css']) {
  const langSrc = path.join(monacoSrc, 'basic-languages', lang);
  if (fs.existsSync(langSrc)) {
    fs.cpSync(langSrc, path.join(monacoDst, 'basic-languages', lang), { recursive: true });
  }
}
