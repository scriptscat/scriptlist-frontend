import type {
  Metadata,
  ScriptListItem,
} from '@/app/[locale]/script-show-page/[id]/types';

/**
 * 裁剪 meta_json，只保留列表渲染需要的字段：
 * - icon / iconURL（图标）— base64 data URI 替换为后端代理 URL
 * - name:* / description:*（i18n 本地化名称和描述）
 *
 * @param scriptId 脚本 ID，用于生成 icon 代理 URL
 * @param updatetime 脚本更新时间，附加到 icon URL 用于缓存失效
 */
function slimMetaJson(meta: Metadata, scriptId?: number, updatetime?: number): Metadata {
  if (!meta) return {} as Metadata;

  const slim: Record<string, string[]> = {};
  for (const key of Object.keys(meta)) {
    if (
      key === 'icon' ||
      key === 'iconURL' ||
      key.startsWith('name:') ||
      key.startsWith('description:')
    ) {
      slim[key] = meta[key];
    }
  }

  // 将 base64 data URI 替换为后端 icon 代理接口 URL
  if (scriptId) {
    const iconKey = slim['icon'] ? 'icon' : slim['iconURL'] ? 'iconURL' : null;
    if (iconKey && slim[iconKey]?.[0]?.startsWith('data:')) {
      const t = updatetime ? `?t=${updatetime}` : '';
      slim[iconKey] = [`/api/v2/scripts/${scriptId}/icon${t}`];
    }
  }

  return slim as Metadata;
}

/**
 * 裁剪 ScriptListItem 列表，只保留 ScriptCard 渲染所需字段。
 * 用于 search/page.tsx 和 users/[id]/page.tsx 等 SSR 页面，
 * 减少序列化到 HTML 中的数据量。
 */
export function slimScriptList(list: ScriptListItem[]): ScriptListItem[] {
  return list.map(
    (item) =>
      ({
        id: item.id,
        user_id: item.user_id,
        username: item.username,
        avatar: item.avatar,
        name: item.name,
        description: item.description,
        category: item.category
          ? { id: item.category.id, name: item.category.name }
          : item.category,
        tags: item.tags?.map((t) => ({ id: t.id, name: t.name })),
        score: item.score,
        score_num: item.score_num,
        type: item.type,
        public: item.public,
        today_install: item.today_install,
        total_install: item.total_install,
        updatetime: item.updatetime,
        script: {
          version: item.script.version,
          meta_json: slimMetaJson(item.script.meta_json, item.id, item.updatetime),
        },
      }) as ScriptListItem,
  );
}

/**
 * 裁剪 ScriptListItem 列表，只保留侧边栏 ScriptListCard 所需的最少字段：
 * - id, name（标题和链接）
 * - script.meta_json 中的 icon/iconURL（图标）
 */
export function slimScriptListForSidebar(
  list: ScriptListItem[],
): ScriptListItem[] {
  return list.map(
    (item) =>
      ({
        id: item.id,
        name: item.name,
        script: {
          meta_json: slimMetaJson(item.script.meta_json, item.id, item.updatetime),
        },
      }) as ScriptListItem,
  );
}
