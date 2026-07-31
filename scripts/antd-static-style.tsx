import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { extractStyle } from '@ant-design/static-style-extract';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import {
  darkToken,
  lightToken,
  getComponents,
  getCssVarConfig,
} from '../src/lib/antd-theme';

export const antdCssOutputPath = './src/app/antd.generated.css';

const MIN_ANTD_CSS_BYTES = 100 * 1024;
const REQUIRED_COMPONENT_CLASSES = [
  'ant-layout',
  'ant-menu',
  'ant-breadcrumb',
  'ant-card',
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

  let rules = 0;
  try {
    const parsed = collectStylesheetFacts(css);
    rules = parsed.rules;

    for (const className of REQUIRED_COMPONENT_CLASSES) {
      if (!parsed.classNames.has(className)) {
        failures.push(`missing component selector .${className}`);
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

  // antd 6.5.3 generates invalid Tour placement selectors during static
  // extraction. Match the component class used by the runtime stylesheet.
  css = css.replace(
    /(:where\([^)]+\))(-placement-(left|leftTop|leftBottom|right|rightTop|rightBottom|top|topLeft|topRight|bottom|bottomLeft|bottomRight)\b)/g,
    '$1.ant-tour$2',
  );

  // Keep generated rules on separate lines so Turbopack can parse the large
  // stylesheet without hitting its long-line parser limit.
  return css.replace(/}\s*/g, '}\n');
}
