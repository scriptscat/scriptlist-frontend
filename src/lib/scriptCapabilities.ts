export interface ScriptCapability {
  key: string;
  risk?: 'high';
}

type Meta = Record<string, string[] | undefined>;

// @grant 值 → 能力分组 key（多个 grant 可归同一 key）
const GRANT_TO_CAP: Record<string, string> = {
  GM_xmlhttpRequest: 'net',
  GM_notification: 'notify',
  GM_setClipboard: 'clipboard',
  GM_getValue: 'storage',
  GM_setValue: 'storage',
  GM_deleteValue: 'storage',
  GM_listValues: 'storage',
  GM_openInTab: 'tab',
  GM_download: 'download',
  GM_cookie: 'cookie',
  GM_registerMenuCommand: 'menu',
};

export function getConnectDomains(meta: Meta | undefined): string[] {
  const list = meta?.connect ?? [];
  return Array.from(new Set(list.map((d) => d.trim()).filter(Boolean)));
}

export function getCapabilities(
  meta: Meta | undefined,
  cookieRisk = false,
): ScriptCapability[] {
  const grants = meta?.grant ?? [];
  const keys: string[] = [];
  for (const g of grants) {
    const key = GRANT_TO_CAP[g.trim()];
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys.map((key) =>
    key === 'cookie' && cookieRisk ? { key, risk: 'high' as const } : { key },
  );
}
