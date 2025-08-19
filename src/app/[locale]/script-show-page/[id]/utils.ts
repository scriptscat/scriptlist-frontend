import type {
  Metadata,
  MetaJson,
  Script,
  ScriptInfo,
  ScriptListItem,
} from '@/app/[locale]/script-show-page/[id]/types';
import { getLocale } from 'next-intl/server';

type Browser = {
  logo: string;
  name: string;
};

const superBrowserMap: Record<string, Browser> = {
  chrome: { logo: 'chrome', name: 'Chrome' },
  firefox: { logo: 'firefox', name: 'Firefox' },
  safari: { logo: 'safari', name: 'Safari' },
  edge: { logo: 'edge', name: 'Edge' },
  opera: { logo: 'opera', name: 'Opera' },
};

export class ScriptUtils {
  static score(score: number, score_num: number): string | null {
    return score ? (score / score_num / 10).toFixed(1) : null;
  }

  static browserCompatible(metaJson: MetaJson): Browser[] {
    if (!metaJson.compatible) {
      return [];
    }
    const browsersKeys: string[] = [];

    metaJson.compatible.forEach((browser) => {
      browser
        .toLowerCase()
        .split(/,|\s+/) // 分割逗号或空格
        .forEach((key) => {
          browsersKeys.push(key.trim());
        });
    });

    // 去重
    const uniqueBrowsers = new Set(browsersKeys);

    return Array.from(uniqueBrowsers)
      .map((browser) => {
        const browserKey = browser.toLowerCase();
        return superBrowserMap[browserKey] || null;
      })
      .filter((browser) => browser !== null);
  }

  static antiFeatures(
    metaJson: MetaJson,
  ): { key: string; description?: string }[] {
    if (!metaJson.antifeature) {
      return [];
    }
    return metaJson.antifeature.map((feature) => {
      const config = feature.split(/\s+/);
      if (config.length > 1) {
        return { key: config[0], description: config.slice(1).join(' ') };
      }
      return { key: feature, description: '' };
    });
  }

  static icon(metaJson: MetaJson): string | null {
    if (metaJson.icon) {
      return metaJson.icon[0];
    }
    if (metaJson.iconURL) {
      return metaJson.iconURL[0];
    }
    return null;
  }

  static getRibbonText(publicStatus: number): string | null {
    switch (publicStatus) {
      case 1:
        return '公开';
      case 2:
        return '不公开';
      case 3:
        return '私有';
      default:
        return null;
    }
  }

  static i18nName(script: ScriptListItem, locale: string): string {
    locale = locale.toLowerCase();
    if (script.script.meta_json['name:' + locale]) {
      return script.script.meta_json['name:' + locale][0];
    }
    return script.name;
  }

  static i18nDescription(script: ScriptListItem, locale: string): string {
    locale = locale.toLowerCase();
    if (script.script.meta_json['description:' + locale]) {
      return script.script.meta_json['description:' + locale][0];
    }
    return script.description;
  }
}

// 从脚本代码抽出Metadata
export function parseMetadata(code: string): Metadata | null {
  let issub = false;
  let regex = /\/\/\s*==UserScript==([\s\S]+?)\/\/\s*==\/UserScript==/m;
  let header = regex.exec(code);
  if (!header) {
    regex = /\/\/\s*==UserSubscribe==([\s\S]+?)\/\/\s*==\/UserSubscribe==/m;
    header = regex.exec(code);
    if (!header) {
      return null;
    }
    issub = true;
  }
  regex = /\/\/\s*@([\S]+)((.+?)$|$)/gm;
  const ret = {} as Metadata;
  let meta: RegExpExecArray | null = regex.exec(header[1]);
  while (meta !== null) {
    const [key, val] = [meta[1].toLowerCase().trim(), meta[2].trim()];
    let values = ret[key];
    if (values == null) {
      values = [];
    }
    values.push(val);
    ret[key] = values;
    meta = regex.exec(header[1]);
  }
  if (ret.name === undefined) {
    return null;
  }
  if (Object.keys(ret).length < 3) {
    return null;
  }
  if (!ret.namespace) {
    ret.namespace = [''];
  }
  if (issub) {
    ret.usersubscribe = [];
  }
  return ret;
}

// 处理tags
export function parseTags(meta: Metadata): string[] {
  const tags: string[] = [];
  if (meta.tag) {
    // 分割, 空格或换行符
    meta.tag.forEach((tag) => {
      tag.split(/[,\s]+/).forEach((t) => {
        const trimmedTag = t.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
          tags.push(trimmedTag);
        }
      });
    });
  }
  return tags;
}
