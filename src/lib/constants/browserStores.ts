/**
 * 脚本猫（ScriptCat）浏览器安装渠道与浏览器检测。
 * 首页安装按钮与「未检测到脚本猫」引导弹窗共用，避免链接 / 检测逻辑散落各处。
 */

/** 脚本猫安装 / 使用教程文档 */
export const SCRIPTCAT_INSTALL_GUIDE_URL =
  'https://docs.scriptcat.org/docs/use/use/';

export type BrowserStoreKey = 'edge' | 'chrome' | 'firefox' | 'crx' | 'default';

// 浏览器商店配置
export interface BrowserStoreConfig {
  url: string;
  icon: string;
  textKey: string;
  target?: string;
}

export const getBrowserStores = (): Record<
  BrowserStoreKey,
  BrowserStoreConfig
> => ({
  edge: {
    url: 'https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh',
    icon: 'logos:microsoft-edge',
    textKey: 'home.browser_stores.add_to_edge',
  },
  chrome: {
    url: 'https://chrome.google.com/webstore/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf',
    icon: 'logos:chrome',
    textKey: 'home.browser_stores.add_to_chrome',
  },
  firefox: {
    url: 'https://addons.mozilla.org/zh-CN/firefox/addon/scriptcat/',
    icon: 'logos:firefox',
    textKey: 'home.browser_stores.add_to_firefox',
  },
  crx: {
    url: 'https://github.com/scriptscat/scriptcat/releases',
    icon: 'noto:package',
    textKey: 'home.browser_stores.download_crx_install',
  },
  default: {
    url: './docs/use/use',
    icon: 'logos:chrome',
    textKey: 'home.browser_stores.install_extension',
    target: '_self',
  },
});

/** chips 等场景下展示的渠道短名（专有名词，无需翻译） */
export const BROWSER_STORE_LABELS: Record<
  Exclude<BrowserStoreKey, 'default'>,
  string
> = {
  chrome: 'Chrome',
  edge: 'Edge',
  firefox: 'Firefox',
  crx: 'CRX / GitHub',
};

/**
 * 通过 UserAgent 识别当前浏览器对应的安装渠道。
 * 注意：Edge 的 UA 同时包含 "chrome" 与 "edg"，需优先判断；未知浏览器回退到 'default'。
 */
export function detectBrowserStore(): BrowserStoreKey {
  const ua =
    typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';

  if (ua.includes('edg')) {
    return 'edge';
  }
  if (ua.includes('firefox')) {
    return 'firefox';
  }
  if (ua.includes('chrome')) {
    return 'chrome';
  }
  return 'default';
}
