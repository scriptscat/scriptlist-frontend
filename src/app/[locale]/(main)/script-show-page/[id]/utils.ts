import type {
  Metadata,
  MetaJson,
  ScriptListItem,
} from '@/app/[locale]/(main)/script-show-page/[id]/types';

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

/**
 * ScriptUtils.icon 需要的最小结构。ScriptListItem 与 ScriptInfo 都满足它。
 */
export type ScriptIconSource = {
  id: number;
  updatetime?: number;
  script?: { meta_json?: Metadata };
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

  /**
   * 返回图标的后端代理 URL。
   *
   * 图标一律经 /api/v2/scripts/:id/icon 走 scriptcat.org,浏览器不再直连
   * 作者填的第三方站点。meta_json 里的原始值只用来判断「有没有图标」,
   * URL 由 id + updatetime 重建,因此对已 slim 过的数据同样幂等。
   *
   * 没有图标时返回 null,调用方渲染兜底(不必请求接口)。
   */
  static icon(script: ScriptIconSource): string | null {
    const meta = script.script?.meta_json;
    const raw = meta?.icon?.[0] ?? meta?.iconURL?.[0];
    if (!raw) {
      return null;
    }
    const t = script.updatetime ? `?t=${script.updatetime}` : '';
    return `/api/v2/scripts/${script.id}/icon${t}`;
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
