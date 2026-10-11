'use client';

import { Skeleton, Spin } from 'antd';

export interface LoadingBlockProps {
  /** 预留的确切高度，与加载完成后的内容等高，避免 CLS。数字按 px 处理。 */
  height: number | string;
  /** `skeleton`（默认）画内容骨架；`spinner` 画居中转圈，适合编辑器 / 图表这类整块替换的区域。 */
  variant?: 'skeleton' | 'spinner';
  /** 已翻译好的文案，由调用方用 `useTranslations('components.loading')` 取好后传入。 */
  label?: string;
  className?: string;
}

/**
 * 通用加载占位块。
 *
 * 加载态最常见的缺陷是「一个看不见的空洞」：容器高度塌成 0，或者只留一片空白，
 * 用户分不清是在加载还是加载失败。这个组件保证两件事：
 * 1. 按调用方声明的高度占位，数据到达时页面不跳动；
 * 2. 永远画出可见的骨架或转圈，配合可选文案说明正在加载什么。
 *
 * 视觉沿用 `MarkdownEditor` 的加载框：主题化边框 + 抬升背景 + 主题切换过渡。
 */
export function LoadingBlock({
  height,
  variant = 'skeleton',
  label,
  className = '',
}: LoadingBlockProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="loading-block"
      style={{ height }}
      className={`overflow-hidden border border-app-primary rounded-lg bg-app-elevated theme-transition ${className}`.trim()}
    >
      {variant === 'spinner' ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <Spin />
          {label && <div className="text-app-secondary text-sm">{label}</div>}
        </div>
      ) : (
        <div className="h-full w-full p-4">
          <Skeleton active paragraph={{ rows: 3 }} />
          {label && (
            <div className="text-app-secondary text-sm mt-2">{label}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoadingBlock;
