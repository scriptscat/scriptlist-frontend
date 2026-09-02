/**
 * 浏览器商店 logo 的按需预注册。
 *
 * 这几个图标是彩色多路径 SVG，体积远大于界面上的单色图标（`noto:package` 21 KB、
 * `logos:firefox` 13 KB），但只有首页的安装按钮和「未检测到脚本管理器」引导弹窗会渲染。
 * 放在全局预注册里等于让登录页、搜索页、管理后台等所有路由都为它们买单，因此拆到这里，
 * 由渲染方以副作用方式引入：
 *
 * ```ts
 * import '@/lib/iconify-preload-browser-stores';
 * ```
 *
 * 图标名与 `constants/browserStores.ts` 中 `getBrowserStores()` 的 `icon` 字段一一对应，
 * 改动那里的图标时记得同步这里，否则会退化为向 Iconify CDN 在线拉取。
 */
import { addIcon } from '@iconify/react';

import chrome from '@iconify-icons/logos/chrome';
import firefox from '@iconify-icons/logos/firefox';
import microsoftEdge from '@iconify-icons/logos/microsoft-edge';
import notoPackage from '@iconify-icons/noto/package';

addIcon('logos:chrome', chrome);
addIcon('logos:firefox', firefox);
addIcon('logos:microsoft-edge', microsoftEdge);
addIcon('noto:package', notoPackage);
