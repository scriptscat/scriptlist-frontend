/**
 * 全站通用的 Iconify 图标预注册。
 *
 * 本模块由根 layout（经 `ThemeClientContext`）引入，会进入**每一条路由**的首屏 JS，
 * 所以这里只放两类图标：体积小，且出现在常驻 UI（导航、搜索栏、广告位）或由后端下发。
 *
 * 未预注册的图标名会自动退化为向 Iconify CDN 在线拉取，因此把大图标移出本模块并不会
 * 让它失效，只是把「随首屏下发」换成「用到时再取」。体积大又只服务于个别功能的图标
 * （浏览器商店 logo）放在 `iconify-preload-browser-stores.ts`，由用到它的组件自行引入。
 *
 * 约束由 `iconify-preload.test.ts` 强制：注册了却没人用会失败，全局体积超预算也会失败。
 */
import { addIcon } from '@iconify/react';

// mingcute — 登录页的 QQ 登录入口
import qqFill from '@iconify-icons/mingcute/qq-fill';
// 注：MainLayout 用到的 mingcute:robot-line 尚未收录进 @iconify-icons/mingcute，
// 无法预注册，会自动退化为在线拉取。

// mdi — 常见 OIDC 提供方（后端下发图标名，见 BACKEND_PROVIDED_ICONS）
import mdiGithub from '@iconify-icons/mdi/github';
import mdiGoogle from '@iconify-icons/mdi/google';
import mdiMicrosoft from '@iconify-icons/mdi/microsoft';
import mdiApple from '@iconify-icons/mdi/apple';

// mdi — 搜索栏 / 搜索页的分区 chips
import mdiFire from '@iconify-icons/mdi/fire';
import mdiNewBox from '@iconify-icons/mdi/new-box';
import mdiLibrary from '@iconify-icons/mdi/library';
import mdiCog from '@iconify-icons/mdi/cog';
import mdiTrendingUp from '@iconify-icons/mdi/trending-up';

// mdi — 广告位标识
import mdiBullhornOutline from '@iconify-icons/mdi/bullhorn-outline';

/**
 * 图标名由后端下发、源码中不会出现的场景。
 *
 * OIDC 登录方式的 `icon` 字段来自后端配置，经 `ProviderIcon` 渲染。这几个常见提供方
 * 体积都不到 1 KB，预注册可以省掉登录页的一次 CDN 往返；未覆盖的提供方仍会在线拉取。
 */
export const BACKEND_PROVIDED_ICONS = [
  'mdi:github',
  'mdi:google',
  'mdi:microsoft',
  'mdi:apple',
] as const;

addIcon('mingcute:qq-fill', qqFill);

addIcon('mdi:github', mdiGithub);
addIcon('mdi:google', mdiGoogle);
addIcon('mdi:microsoft', mdiMicrosoft);
addIcon('mdi:apple', mdiApple);

addIcon('mdi:fire', mdiFire);
addIcon('mdi:new-box', mdiNewBox);
addIcon('mdi:library', mdiLibrary);
addIcon('mdi:cog', mdiCog);
addIcon('mdi:trending-up', mdiTrendingUp);

addIcon('mdi:bullhorn-outline', mdiBullhornOutline);
