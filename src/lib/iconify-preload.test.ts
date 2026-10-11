import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BACKEND_PROVIDED_ICONS } from './iconify-preload';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));
const libRoot = fileURLToPath(new URL('.', import.meta.url));

/**
 * 预注册模块：`iconify-preload.ts` 全站生效，`iconify-preload-*.ts` 由具体功能按需引入。
 * 未注册的图标名会退化为向 Iconify CDN 在线拉取，所以「注册」和「体积」是一对权衡。
 */
function listPreloadModules(): string[] {
  return fs
    .readdirSync(libRoot)
    .filter((f) => /^iconify-preload.*\.ts$/.test(f) && !f.endsWith('.test.ts'))
    .map((f) => path.join(libRoot, f));
}

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });
}

/** 从 `addIcon('logos:chrome', chrome)` 里取出图标名。 */
function registeredIcons(file: string): string[] {
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/addIcon\(\s*'([^']+)'/g)].map((m) => m[1]);
}

const preloadModules = listPreloadModules();
const preloadSet = new Set(preloadModules);
const consumerFiles = listSourceFiles(srcRoot).filter(
  (f) => !preloadSet.has(f),
);

describe('iconify 预注册', () => {
  it('注册的每个图标都能在源码里找到使用点', () => {
    const orphans: string[] = [];
    const backendProvided = new Set<string>(BACKEND_PROVIDED_ICONS);

    for (const preloadFile of preloadModules) {
      for (const icon of registeredIcons(preloadFile)) {
        // 后端下发的图标名不会出现在源码里，由 BACKEND_PROVIDED_ICONS 显式豁免。
        if (backendProvided.has(icon)) continue;
        const used = consumerFiles.some((f) =>
          fs.readFileSync(f, 'utf8').includes(icon),
        );
        if (!used) {
          orphans.push(`${icon} (${path.basename(preloadFile)})`);
        }
      }
    }

    expect(
      orphans,
      '这些图标被预注册进首屏 JS，但源码里没有任何地方渲染它们。' +
        '每个图标都是实打实的字节：logos:safari 一个就有 36 KB。请删除，' +
        '或说明它是由后端下发的动态图标名。',
    ).toEqual([]);
  });

  it('全局预注册模块保持轻量', () => {
    // 全局模块随根 layout 进入**每一条**路由的首屏，因此只放体积小、
    // 且在常驻 UI（导航、搜索栏、广告位）或后端下发场景中会用到的图标。
    // 浏览器商店 logo 这类大图标属于具体功能，放进按需模块由功能自己引入。
    const BUDGET_BYTES = 12 * 1024;

    const icons = registeredIcons(path.join(libRoot, 'iconify-preload.ts'));
    const bytes = icons.reduce((total, icon) => {
      const [collection, name] = icon.split(':');
      const data = require(`@iconify-icons/${collection}/${name}`);
      return total + JSON.stringify(data.default ?? data).length;
    }, 0);

    expect(
      bytes,
      `全局预注册图标共 ${(bytes / 1024).toFixed(1)} KB，超出 ${BUDGET_BYTES / 1024} KB 预算。` +
        '大图标请移到按需模块，否则每个页面都要为它买单。',
    ).toBeLessThanOrEqual(BUDGET_BYTES);
  });
});
