import fs from 'fs';
import { antdCssOutputPath, assertAntdCssIntegrity } from './antd-static-style';

const css = fs.readFileSync(antdCssOutputPath, 'utf8');
const metrics = assertAntdCssIntegrity(css);

console.log(
  `Verified Ant Design CSS: ${metrics.bytes} bytes, ${metrics.rules} rules`,
);
