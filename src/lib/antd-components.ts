/**
 * Ant Design 组件白名单，供 `scripts/antd-static-style.tsx` 做静态 CSS 提取。
 *
 * `extractStyle` 在不传 `includes` 时会渲染 antd 的**全部**导出（v6 下 74 个），
 * 把整套组件的 CSS 都写进 `src/app/antd.generated.css`。那份样式表由根 layout
 * 无条件引入，是每个页面的 render-blocking 资源，因此未使用组件的样式是纯粹的
 * 首屏成本。这里显式列出需要提取的组件，等价于对 CSS 做一次树摇。
 *
 * 这份清单必须与源码里真实 import 的 antd 组件保持一致，
 * 由 `antd-components.test.ts` 扫描 `src/` 强制校验，新增组件却忘记登记时测试会失败。
 *
 * 注意：本模块只导出纯数据，不要在此引入 `node:fs` 等构建期依赖——
 * 它与 `antd-theme.ts` 一样同时被构建脚本和测试引用。
 */

/**
 * 源码中直接 `import { X } from 'antd'` 的组件。
 *
 * `ConfigProvider` 保留在列表中只为与源码 import 对齐；`extractStyle` 内部的
 * 黑名单会跳过它（以及 `Grid`），不会产出样式。
 */
export const ANTD_IMPORTED_COMPONENTS = [
  'Alert',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Card',
  'Checkbox',
  'Col',
  'Collapse',
  'ConfigProvider',
  'DatePicker',
  'Descriptions',
  'Divider',
  'Drawer',
  'Dropdown',
  'Empty',
  'Form',
  'Input',
  'InputNumber',
  'Layout',
  'List',
  'Menu',
  'Modal',
  'Pagination',
  'Popconfirm',
  'Progress',
  'Radio',
  'Rate',
  'Result',
  'Row',
  'Segmented',
  'Select',
  'Skeleton',
  'Slider',
  'Space',
  'Spin',
  'Statistic',
  'Switch',
  'Table',
  'Tabs',
  'Tag',
  'Tooltip',
  'Typography',
  'Upload',
  'message',
] as const;

/**
 * 源码没有直接 import、但会被上面某个组件在运行时渲染出来的组件。
 *
 * 静态提取只渲染组件的收起状态，这类「浮层 / 子面板」样式不会被上面的清单顺带带出，
 * 漏掉就会在用户交互时出现无样式元素，所以必须显式登记，并写明是谁需要它。
 */
export const ANTD_IMPLICIT_COMPONENTS = [
  /** `Popconfirm` 与 `Tooltip` 的浮层复用 Popover 的样式。 */
  'Popover',
  /** `DatePicker` 开启 `showTime` 后弹出的时间面板。 */
  'TimePicker',
] as const;

/** 传给 `extractStyle({ includes })` 的最终清单。 */
export const ANTD_STATIC_STYLE_COMPONENTS: readonly string[] = [
  ...ANTD_IMPORTED_COMPONENTS,
  ...ANTD_IMPLICIT_COMPONENTS,
];
