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

let css = extractStyle((node) => (
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

// 修复 antd v6 Tour 组件的 CSS bug：
// 生成的选择器如 `:where(.css-HASH)-placement-left` 是无效 CSS，
// 缺少 `.ant-tour` 前缀，需要补全为 `:where(.css-HASH).ant-tour-placement-left`
css = css.replace(
  /(:where\([^)]+\))(-placement-(left|leftTop|leftBottom|right|rightTop|rightBottom|top|topLeft|topRight|bottom|bottomLeft|bottomRight)\b)/g,
  '$1.ant-tour$2',
);

// 每条规则换行，避免超长行导致 Turbopack CSS 解析失败
css = css.replace(/}\s*/g, '}\n');

// 创建目录
fs.mkdirSync('./public/styles', { recursive: true });
fs.writeFileSync(outputPath, css);

// Monaco 0.56 的 AMD 入口会引用带内容哈希的根级 chunk 与 assets worker，
// 无法再按旧版 base/editor/language 固定目录安全裁剪。复制官方 min/vs 发布树，
// 并先清理旧输出，避免已删除或改名的资源被上一次构建残留掩盖。
const monacoSrc = './node_modules/monaco-editor/min/vs';
const monacoDst = './public/assets/monaco-editor/min/vs';

fs.rmSync(monacoDst, { recursive: true, force: true });
fs.mkdirSync(path.dirname(monacoDst), { recursive: true });
fs.cpSync(monacoSrc, monacoDst, { recursive: true });
