import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));
const appRoot = path.join(srcRoot, 'app');

/**
 * 服务端组件从 `'antd'` barrel 具名导入时，Next 必须为**整个 barrel** 建立客户端引用，
 * `optimizePackageImports` 随之失效，antd 全部 ~78 个组件都会进入该路由的首屏 JS
 * （实测约 89 KB gzip 的未使用组件代码）。
 *
 * 客户端组件不受影响：barrel 在客户端边界内可以正常摇树。因此这条约束只针对
 * 「从 page/layout 出发、沿未标记 `'use client'` 的模块可达」的那部分文件——
 * 这正是 Next 判定服务端组件的规则。
 *
 * 修法是改成深层导入（`antd/es/spin`），既不改渲染语义也不改标记。
 */

function isClientModule(source: string): boolean {
  // 指令必须位于模块首部，出现在 import 之前。
  const head = source.slice(0, 400);
  return /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*['"]use client['"]/.test(
    head,
  );
}

/** 解析 `@/x` 与相对路径到磁盘上的文件，解析不到（三方包等）返回 null。 */
function resolveImport(specifier: string, fromFile: string): string | null {
  let base: string;
  if (specifier.startsWith('@/')) {
    base = path.join(srcRoot, specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  for (const candidate of [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

/**
 * 值导入的目标模块。`import type` 会被编译期擦除，不会把目标拉进服务端图里，
 * 因此必须跳过——否则像 `scripts.ts` 里那句 `import type { GrayControlValue }`
 * 会把一个纯客户端组件误判成服务端可达。
 */
function importSpecifiers(source: string): string[] {
  return [
    ...source.matchAll(
      /(?:^|\n)\s*import\s+(type\s+)?([^;]*?)from\s*'([^']+)'/g,
    ),
  ]
    .filter(([, typeOnly]) => !typeOnly)
    .map((m) => m[3]);
}

/** 该文件是否从 `'antd'` barrel 做了**值**导入（纯类型导入会被擦除，不产生引用）。 */
function importsAntdBarrelValue(source: string): boolean {
  return [
    ...source.matchAll(
      /(?:^|\n)\s*import\s+(type\s+)?\{([^{}]*)\}\s*from\s*'antd'/g,
    ),
  ].some(([, typeOnly, specifiers]) => {
    if (typeOnly) return false;
    return specifiers
      .split(',')
      .some((s) => s.trim() && !/^type\s/.test(s.trim()));
  });
}

/**
 * antd 会在运行时把 Input/Button/Avatar 等挂到 Skeleton 默认导出上。
 * 经过 RSC 客户端引用边界后这些静态属性不会被保留，最终会把 undefined 交给 React。
 */
function usesSkeletonStaticMember(source: string): boolean {
  const defaultImport = source.match(
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+'antd\/es\/skeleton'/,
  );
  if (!defaultImport) return false;
  return new RegExp(`<${defaultImport[1]}\\.[A-Z]`).test(source);
}

function listEntryPoints(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listEntryPoints(full);
    return /^(page|layout|loading|template|default|error|not-found)\.tsx$/.test(
      entry.name,
    )
      ? [full]
      : [];
  });
}

/**
 * 从每个 page/layout 出发遍历，遇到 `'use client'` 就停下（进入客户端边界），
 * 收集途中所有仍属服务端的模块。
 */
function collectServerModules(): Map<string, string[]> {
  const serverModules = new Map<string, string[]>();
  const visited = new Set<string>();

  const walk = (file: string, trail: string[]) => {
    if (visited.has(file)) return;
    visited.add(file);

    const source = fs.readFileSync(file, 'utf8');
    if (isClientModule(source)) return;

    serverModules.set(file, trail);
    for (const specifier of importSpecifiers(source)) {
      const resolved = resolveImport(specifier, file);
      if (resolved) walk(resolved, [...trail, path.relative(srcRoot, file)]);
    }
  };

  for (const entry of listEntryPoints(appRoot)) walk(entry, []);
  return serverModules;
}

describe('服务端组件不得从 antd barrel 导入', () => {
  it('没有服务端可达模块具名导入 antd', () => {
    const offenders: string[] = [];

    for (const [file, trail] of collectServerModules()) {
      if (importsAntdBarrelValue(fs.readFileSync(file, 'utf8'))) {
        const via = trail.length ? ` ← ${trail[trail.length - 1]}` : ' (入口)';
        offenders.push(`${path.relative(srcRoot, file)}${via}`);
      }
    }

    expect(
      offenders,
      "服务端组件从 'antd' 具名导入会让整个 antd barrel 变成客户端引用，" +
        '该路由首屏会多出约 89 KB gzip 的未使用组件。' +
        "请改用深层导入，例如 import Spin from 'antd/es/spin'。",
    ).toEqual([]);
  });

  it('服务端可达模块不通过 Skeleton 静态属性渲染子组件', () => {
    const offenders: string[] = [];

    for (const [file, trail] of collectServerModules()) {
      if (usesSkeletonStaticMember(fs.readFileSync(file, 'utf8'))) {
        const via = trail.length ? ` ← ${trail[trail.length - 1]}` : ' (入口)';
        offenders.push(`${path.relative(srcRoot, file)}${via}`);
      }
    }

    expect(
      offenders,
      '服务端 RSC 引用不会保留 Skeleton.Input/Button/Avatar 等运行时静态属性。' +
        "请从 '@/components/ui/AntdSkeleton' 导入对应的独立组件。",
    ).toEqual([]);
  });
});
