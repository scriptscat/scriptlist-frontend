// 脚本许可协议（License）共享配置与纯工具函数。
//
// 真相源是脚本 `==UserScript==` / `==UserSubscribe==` 头部里的 `// @license` 行；
// 编辑器选择器与详情页标签都只是它的「视图」。本文件保持纯 TS（无 React），
// 同时被 ScriptEditor（写入/解析头部）和 ScriptDetailClient（展示标签）使用。

export type LicenseCategory =
  | 'permissive' // 宽松（MIT/Apache/BSD…）
  | 'copyleft' // Copyleft（GPL/LGPL/MPL…）
  | 'proprietary' // 禁止二开 / 保留所有权利
  | 'custom'; // 自定义 / 未识别

// 「禁止二开」写入脚本头部的 @license 值。
export const NO_DERIVATIVE_VALUE = 'All Rights Reserved';
// Select 中「自定义」选项的哨兵值（不会写入头部）。
export const CUSTOM_LICENSE = '__custom__';

export interface LicenseDef {
  // 写入头部 @license 的规范值，同时作为 Select 选项的 value。
  value: string;
  category: LicenseCategory;
  // 协议说明链接（详情页标签可点击跳转）；禁止二开/自定义无链接。
  url?: string;
  // 下拉分组：开源协议 / 其他。
  group: 'opensource' | 'other';
}

// 下拉提供的标准协议集 + 禁止二开。自定义作为哨兵单列，不在此表。
export const LICENSE_DEFS: LicenseDef[] = [
  {
    value: 'MIT',
    category: 'permissive',
    url: 'https://opensource.org/license/mit',
    group: 'opensource',
  },
  {
    value: 'Apache-2.0',
    category: 'permissive',
    url: 'https://www.apache.org/licenses/LICENSE-2.0',
    group: 'opensource',
  },
  {
    value: 'BSD-2-Clause',
    category: 'permissive',
    url: 'https://opensource.org/license/BSD-2-Clause',
    group: 'opensource',
  },
  {
    value: 'BSD-3-Clause',
    category: 'permissive',
    url: 'https://opensource.org/license/BSD-3-Clause',
    group: 'opensource',
  },
  {
    value: 'MPL-2.0',
    category: 'copyleft',
    url: 'https://www.mozilla.org/MPL/2.0/',
    group: 'opensource',
  },
  {
    value: 'LGPL-2.1',
    category: 'copyleft',
    url: 'https://www.gnu.org/licenses/old-licenses/lgpl-2.1',
    group: 'opensource',
  },
  {
    value: 'LGPL-3.0',
    category: 'copyleft',
    url: 'https://www.gnu.org/licenses/lgpl-3.0',
    group: 'opensource',
  },
  {
    value: 'GPL-2.0',
    category: 'copyleft',
    url: 'https://www.gnu.org/licenses/old-licenses/gpl-2.0',
    group: 'opensource',
  },
  {
    value: 'GPL-3.0',
    category: 'copyleft',
    url: 'https://www.gnu.org/licenses/gpl-3.0',
    group: 'opensource',
  },
  {
    value: 'AGPL-3.0',
    category: 'copyleft',
    url: 'https://www.gnu.org/licenses/agpl-3.0',
    group: 'opensource',
  },
  { value: NO_DERIVATIVE_VALUE, category: 'proprietary', group: 'other' },
];

// 兼容历史写法 / 常见别名 → 规范值（键为大写）。
const LICENSE_ALIASES: Record<string, string> = {
  'BSD-2': 'BSD-2-Clause',
  'BSD-3': 'BSD-3-Clause',
  'MPL2.0': 'MPL-2.0',
  GPLV2: 'GPL-2.0',
  GPLV3: 'GPL-3.0',
  AGPLV3: 'AGPL-3.0',
  LGPLV3: 'LGPL-3.0',
  'ALL RIGHTS RESERVED': NO_DERIVATIVE_VALUE,
  PROPRIETARY: NO_DERIVATIVE_VALUE,
};

const DEF_BY_UPPER: Record<string, LicenseDef> = LICENSE_DEFS.reduce(
  (acc, def) => {
    acc[def.value.toUpperCase()] = def;
    return acc;
  },
  {} as Record<string, LicenseDef>,
);

// 把原始 @license 文本规范成已知协议值；未识别返回 null。
export function normalizeKnown(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const up = raw.trim().toUpperCase();
  if (DEF_BY_UPPER[up]) {
    return DEF_BY_UPPER[up].value;
  }
  if (LICENSE_ALIASES[up]) {
    return LICENSE_ALIASES[up];
  }
  return null;
}

// Ant Design Tag 预设色。
const CATEGORY_COLOR: Record<LicenseCategory, string> = {
  permissive: 'green',
  copyleft: 'blue',
  proprietary: 'red',
  custom: 'default',
};

export interface LicenseDisplay {
  // 原始文本（用户实际写入头部的内容）。
  raw: string;
  // 已识别时的规范值，否则为原始文本。
  canonical: string;
  category: LicenseCategory;
  color: string;
  url?: string;
  known: boolean;
}

// 详情页用：根据原始 @license 文本得到展示信息。
export function getLicenseDisplay(raw: string): LicenseDisplay {
  const canonical = normalizeKnown(raw);
  if (canonical) {
    const def = DEF_BY_UPPER[canonical.toUpperCase()];
    return {
      raw,
      canonical,
      category: def.category,
      color: CATEGORY_COLOR[def.category],
      url: def.url,
      known: true,
    };
  }
  return {
    raw,
    canonical: raw,
    category: 'custom',
    color: CATEGORY_COLOR.custom,
    known: false,
  };
}

// ---- 脚本头部读写（纯文本处理）----

const HEADER_START = /^\s*\/\/\s*==(?:UserScript|UserSubscribe)==\s*$/;
const HEADER_END = /^\s*\/\/\s*==\/(?:UserScript|UserSubscribe)==\s*$/;
const META_LINE = /^\s*\/\/\s*@\S/;
const LICENSE_LINE = /^\s*\/\/\s*@license\b/i;
const LICENSE_VALUE = /^\s*\/\/\s*@license\s+(.+?)\s*$/i;

// 是否含完整的 UserScript/UserSubscribe 头部块。
export function hasUserScriptHeader(code: string): boolean {
  return (
    /\/\/\s*==(?:UserScript|UserSubscribe)==/.test(code) &&
    /\/\/\s*==\/(?:UserScript|UserSubscribe)==/.test(code)
  );
}

// 定位头部块的起止行号（不含返回时的边界行内容判断）。
function findHeaderRange(
  lines: string[],
): { start: number; end: number } | null {
  const start = lines.findIndex((l) => HEADER_START.test(l));
  if (start === -1) {
    return null;
  }
  for (let i = start + 1; i < lines.length; i++) {
    if (HEADER_END.test(lines[i])) {
      return { start, end: i };
    }
  }
  return null;
}

// 读取头部中的 @license 值（首条）；无则返回 null。
export function getLicenseFromCode(code: string): string | null {
  const lines = code.split(/\r?\n/);
  const range = findHeaderRange(lines);
  if (!range) {
    return null;
  }
  for (let i = range.start + 1; i < range.end; i++) {
    const m = LICENSE_VALUE.exec(lines[i]);
    if (m) {
      return m[1];
    }
  }
  return null;
}

// 写入 / 替换 / 删除头部的 @license 行，返回新代码。
// - license 为空：删除所有 @license 行。
// - 已存在：去掉全部旧的，再插入一条新的。
// - 不存在：插到最后一条 @ 指令之后；若没有 @ 指令则追加到块末尾。
// - 无头部块：原样返回（无法注入）。
export function setLicenseInCode(code: string, license: string): string {
  const value = (license || '').trim();
  const eol = code.includes('\r\n') ? '\r\n' : '\n';
  const lines = code.split(/\r?\n/);
  const range = findHeaderRange(lines);
  if (!range) {
    return code;
  }

  const meta = lines.slice(range.start + 1, range.end);
  // 取一条已有 @ 行的注释前缀（含缩进），保持风格一致。
  const sample = meta.find((l) => META_LINE.test(l));
  let prefix = '// ';
  if (sample) {
    const pm = /^(\s*\/\/\s*)@/.exec(sample);
    if (pm) {
      prefix = pm[1];
    }
  }

  const filtered = meta.filter((l) => !LICENSE_LINE.test(l));
  if (value) {
    const licLine = `${prefix}@license ${value}`;
    let lastAt = -1;
    for (let i = 0; i < filtered.length; i++) {
      if (META_LINE.test(filtered[i])) {
        lastAt = i;
      }
    }
    if (lastAt === -1) {
      filtered.push(licLine);
    } else {
      filtered.splice(lastAt + 1, 0, licLine);
    }
  }

  const next = [
    ...lines.slice(0, range.start + 1),
    ...filtered,
    ...lines.slice(range.end),
  ];
  return next.join(eol);
}
