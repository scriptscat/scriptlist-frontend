/**
 * 反馈（issue）列表 / 详情页用到的图标按需预注册。
 *
 * 只有反馈相关页面会渲染，放进全局预注册会让所有路由买单；由渲染方以副作用方式引入：
 *
 * ```ts
 * import '@/lib/iconify-preload-issue';
 * ```
 */
import { addIcon } from '@iconify/react';

import mdiCheckCircleOutline from '@iconify-icons/mdi/check-circle-outline';
import mdiCommentOutline from '@iconify-icons/mdi/comment-outline';
import mdiRecordCircleOutline from '@iconify-icons/mdi/record-circle-outline';

addIcon('mdi:record-circle-outline', mdiRecordCircleOutline);
addIcon('mdi:check-circle-outline', mdiCheckCircleOutline);
addIcon('mdi:comment-outline', mdiCommentOutline);
