import fs from 'fs';
import path from 'path';
import {
  antdCssOutputPath,
  assertAntdCssIntegrity,
  generateAntdCss,
} from './antd-static-style';

const antdCss = generateAntdCss();
const antdCssMetrics = assertAntdCssIntegrity(antdCss);

fs.mkdirSync(path.dirname(antdCssOutputPath), { recursive: true });
fs.writeFileSync(antdCssOutputPath, antdCss);
console.log(
  `Generated Ant Design CSS: ${antdCssMetrics.bytes} bytes, ${antdCssMetrics.rules} rules`,
);

// Monaco 0.56 的 AMD 入口会引用带内容哈希的根级 chunk 与 assets worker，
// 无法再按旧版 base/editor/language 固定目录安全裁剪。复制官方 min/vs 发布树，
// 并先清理旧输出，避免已删除或改名的资源被上一次构建残留掩盖。
const monacoSrc = './node_modules/monaco-editor/min/vs';
const monacoDst = './public/assets/monaco-editor/min/vs';

fs.rmSync(monacoDst, { recursive: true, force: true });
fs.mkdirSync(path.dirname(monacoDst), { recursive: true });
fs.cpSync(monacoSrc, monacoDst, { recursive: true });
