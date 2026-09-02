import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  ANTD_IMPLICIT_COMPONENTS,
  ANTD_IMPORTED_COMPONENTS,
  ANTD_STATIC_STYLE_COMPONENTS,
} from './antd-components';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });
}

/**
 * 去掉块注释与整行 `//` 注释，避免文档里的示例 import 被当成真实用法。
 * 行尾注释不处理：import 语句后面挂 `//` 不影响具名导入的解析。
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/**
 * `extractStyle` 只会渲染首字母大写的导出，外加 `message` / `notification`
 * 两个命令式 API（见 `@ant-design/static-style-extract` 的 `defaultRenderNode`）。
 * 其余小写导出（如 `theme` 这类 token API）不产生任何 CSS，无需登记。
 */
function bearsStyle(name: string): boolean {
  return (
    name[0] === name[0].toUpperCase() ||
    name === 'message' ||
    name === 'notification'
  );
}

/**
 * 收集源码里所有 `import { ... } from 'antd'` 的**值**导入。
 *
 * 只认 `from 'antd'` 这一种写法：项目里对 antd 的深层引用（`antd/es/table`）
 * 都是 `import type`，不产生样式，无需提取。
 * 类型导入（`import type { TableProps }` 与内联 `{ type TableProps }`）同样跳过——
 * 它们在运行时不存在，也就不会带来任何 CSS。
 */
function collectAntdValueImports(): Map<string, string[]> {
  const usage = new Map<string, string[]>();
  const importPattern = /import\s+(type\s+)?\{([^{}]*)\}\s*from\s*'antd'/g;

  for (const file of listSourceFiles(srcRoot)) {
    const source = stripComments(fs.readFileSync(file, 'utf8'));
    for (const match of source.matchAll(importPattern)) {
      const [, typeOnly, specifiers] = match;
      if (typeOnly) continue;
      for (const raw of specifiers.split(',')) {
        const specifier = raw.trim();
        if (!specifier || /^type\s/.test(specifier)) continue;
        const name = specifier.split(/\s+as\s+/)[0].trim();
        if (!name) continue;
        usage.set(name, [
          ...(usage.get(name) ?? []),
          path.relative(srcRoot, file),
        ]);
      }
    }
  }
  return usage;
}

describe('ANTD_STATIC_STYLE_COMPONENTS', () => {
  const imported = collectAntdValueImports();

  /**
   * antd 的运行时导出。用它过滤掉纯类型名，也顺带保证白名单里没有拼错的名字——
   * `extractStyle` 对无效名字是静默忽略的。
   */
  let antdExports: Record<string, unknown>;

  beforeAll(async () => {
    antdExports = (await import('antd')) as unknown as Record<string, unknown>;
  });

  it('覆盖源码中直接 import 的每一个 antd 组件', () => {
    const missing = [...imported.keys()]
      .filter((name) => name in antdExports && bearsStyle(name))
      .filter((name) => !ANTD_STATIC_STYLE_COMPONENTS.includes(name))
      .map((name) => `${name} (${imported.get(name)!.slice(0, 3).join(', ')})`);

    expect(
      missing,
      '这些 antd 组件在源码里用到了，但没登记进白名单，' +
        '静态提取会漏掉它们的 CSS。请补进 ANTD_IMPORTED_COMPONENTS。',
    ).toEqual([]);
  });

  it('不包含源码里已经不再使用的组件', () => {
    const stale = ANTD_IMPORTED_COMPONENTS.filter(
      (name) => !imported.has(name),
    );

    expect(
      stale,
      '这些组件已经从源码中移除，留在白名单里会让 antd.generated.css 白白变大。' +
        '若确实是被其他组件间接渲染的，请移到 ANTD_IMPLICIT_COMPONENTS 并写明原因。',
    ).toEqual([]);
  });

  it('间接依赖项不与直接 import 的组件重复', () => {
    const duplicated = ANTD_IMPLICIT_COMPONENTS.filter((name) =>
      (ANTD_IMPORTED_COMPONENTS as readonly string[]).includes(name),
    );

    expect(duplicated).toEqual([]);
  });

  it('只包含真实存在的 antd 导出', () => {
    const unknown = ANTD_STATIC_STYLE_COMPONENTS.filter(
      (name) => !(name in antdExports),
    );

    expect(
      unknown,
      'antd 升级后可能重命名或移除了导出；白名单里的无效名字会被静默忽略。',
    ).toEqual([]);
  });
});
