import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { extractStyle } from '@ant-design/static-style-extract';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { ANTD_STATIC_STYLE_COMPONENTS } from '../src/lib/antd-components';
import {
  darkToken,
  lightToken,
  getComponents,
  getCssVarConfig,
} from '../src/lib/antd-theme';

export const antdCssOutputPath = './src/app/antd.generated.css';

const MIN_ANTD_CSS_BYTES = 100 * 1024;
/**
 * 上界用来守住组件白名单带来的裁剪效果：`extractStyle` 一旦退回「渲染全部组件」，
 * 产物会从约 940 KB 涨回约 1230 KB，这里会直接失败而不是悄悄多发 30 KB gzip 给每个页面。
 * 留了一定余量以容纳 antd 小版本升级带来的正常增长。
 */
const MAX_ANTD_CSS_BYTES = 1100 * 1024;
/**
 * 抽样自 `ANTD_STATIC_STYLE_COMPONENTS` 的必备选择器，覆盖布局骨架与几个
 * 「只在交互时才出现」的浮层——后者最容易在裁剪时被漏掉且不易在页面上一眼看出。
 */
const REQUIRED_COMPONENT_CLASSES = [
  'ant-layout',
  'ant-menu',
  'ant-breadcrumb',
  'ant-card',
  'ant-btn',
  'ant-table',
  'ant-form',
  'ant-select',
  'ant-picker',
  'ant-picker-dropdown',
  'ant-modal',
  'ant-drawer',
  'ant-dropdown',
  'ant-popover',
  'ant-tooltip',
  'ant-message',
  'ant-upload',
  'ant-tabs',
  'ant-pagination',
] as const;
/**
 * 明确排除的组件。它们的选择器一旦重新出现，说明白名单被绕过或有组件被误加，
 * 而这类回退在页面上完全看不出来，只会表现为体积悄悄变大。
 */
const FORBIDDEN_COMPONENT_CLASSES = [
  'ant-affix',
  'ant-anchor',
  'ant-carousel',
  'ant-cascader',
  'ant-color-picker',
  'ant-image',
  'ant-mentions',
  'ant-notification',
  'ant-picker-calendar',
  'ant-qrcode',
  'ant-splitter',
  'ant-steps',
  'ant-timeline',
  'ant-tour',
  'ant-transfer',
  // TreeSelect 专属。这里不能用 `.ant-tree`：Table 的树形筛选面板会合法地引用它，
  // 尽管项目暂未使用 `filterMode: 'tree'`。
  'ant-tree-select',
  'ant-watermark',
] as const;
const REQUIRED_THEME_CLASSES = ['light', 'dark'] as const;

interface AntdCssMetrics {
  bytes: number;
  rules: number;
}

function collectStylesheetFacts(css: string): {
  classNames: Set<string>;
  variablesByClass: Map<string, Map<string, string>>;
  rules: number;
} {
  const root = postcss.parse(css);
  const classNames = new Set<string>();
  const variablesByClass = new Map<string, Map<string, string>>();
  let rules = 0;

  root.walkRules((rule) => {
    rules += 1;
    const ruleClassNames = new Set<string>();
    selectorParser((selectors) => {
      selectors.walkClasses((classNode) => {
        classNames.add(classNode.value);
        ruleClassNames.add(classNode.value);
      });
    }).processSync(rule.selector);

    rule.walkDecls(/^--ant-/, (declaration) => {
      ruleClassNames.forEach((className) => {
        const variables = variablesByClass.get(className) ?? new Map();
        variables.set(declaration.prop, declaration.value);
        variablesByClass.set(className, variables);
      });
    });
  });

  return { classNames, variablesByClass, rules };
}

export function assertAntdCssIntegrity(
  css: string,
  source = antdCssOutputPath,
): AntdCssMetrics {
  const bytes = Buffer.byteLength(css);
  const failures: string[] = [];

  if (bytes < MIN_ANTD_CSS_BYTES) {
    failures.push(
      `expected at least ${MIN_ANTD_CSS_BYTES} bytes, received ${bytes}`,
    );
  }
  if (bytes > MAX_ANTD_CSS_BYTES) {
    failures.push(
      `expected at most ${MAX_ANTD_CSS_BYTES} bytes, received ${bytes}; ` +
        'the component allowlist in src/lib/antd-components.ts may no longer be applied',
    );
  }

  let rules = 0;
  try {
    const parsed = collectStylesheetFacts(css);
    rules = parsed.rules;

    for (const className of REQUIRED_COMPONENT_CLASSES) {
      if (!parsed.classNames.has(className)) {
        failures.push(`missing component selector .${className}`);
      }
    }
    for (const className of FORBIDDEN_COMPONENT_CLASSES) {
      if (parsed.classNames.has(className)) {
        failures.push(
          `unexpected selector .${className} for an excluded component`,
        );
      }
    }
    const themePrimaryColors = new Map<string, string>();
    for (const className of REQUIRED_THEME_CLASSES) {
      const variables = parsed.variablesByClass.get(className);
      const colorPrimary = variables?.get('--ant-color-primary');
      if (!variables || variables.size < 100 || !colorPrimary) {
        failures.push(
          `theme scope .${className} has ${variables?.size ?? 0} Ant Design variables and --ant-color-primary=${colorPrimary ?? 'missing'}`,
        );
      } else {
        themePrimaryColors.set(className, colorPrimary);
      }
    }
    if (
      themePrimaryColors.size === REQUIRED_THEME_CLASSES.length &&
      themePrimaryColors.get('light') === themePrimaryColors.get('dark')
    ) {
      failures.push(
        'light and dark theme scopes contain the same primary color',
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`could not parse the stylesheet: ${message}`);
  }

  if (failures.length > 0) {
    throw new Error(
      `Ant Design static CSS integrity check failed for ${source}:\n- ${failures.join('\n- ')}`,
    );
  }

  return { bytes, rules };
}

export function generateAntdCss(): string {
  // 不传 `includes` 时 `extractStyle` 会渲染 antd 的全部导出，把整套组件样式都写进
  // 这份全局样式表。它由根 layout 无条件引入，未使用组件的 CSS 是纯粹的首屏成本，
  // 因此这里按白名单裁剪 —— 相当于对 CSS 做树摇。
  let css = extractStyle({
    includes: [...ANTD_STATIC_STYLE_COMPONENTS],
    customTheme: (node) => (
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
    ),
  });

  // antd 6.5.3 generates invalid Tour placement selectors during static
  // extraction. Match the component class used by the runtime stylesheet.
  // Tour 目前不在白名单内，这段替换不会命中任何规则；保留是为了在 Tour 被重新
  // 启用时仍然生效。若它误伤了其他组件，`.ant-tour` 会出现在产物里，
  // 上面的 FORBIDDEN_COMPONENT_CLASSES 会立刻失败。
  css = css.replace(
    /(:where\([^)]+\))(-placement-(left|leftTop|leftBottom|right|rightTop|rightBottom|top|topLeft|topRight|bottom|bottomLeft|bottomRight)\b)/g,
    '$1.ant-tour$2',
  );

  // Keep generated rules on separate lines so Turbopack can parse the large
  // stylesheet without hitting its long-line parser limit.
  return css.replace(/}\s*/g, '}\n');
}
