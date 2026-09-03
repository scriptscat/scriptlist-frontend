import Skeleton from 'antd/es/skeleton';

/**
 * 代码区（Monaco）的加载骨架。
 *
 * Monaco 是 `dynamic({ ssr: false })` 加载的，原来的 fallback 是
 * `<div style={{ height: 600 }} />` —— 高度是留住了，但屏幕上是一片什么都没有的空白，
 * 用户分不清「在加载」还是「加载挂了」。这里画出代码编辑器真实的形状：
 * 左侧 40px 行号槽 + 右侧长短不一的代码行，等宽高度与真实编辑器一致，不产生 CLS。
 *
 * 没有 `'use client'`：既要被 `loading.tsx`（服务端）直接渲染，
 * 也要被 `ScriptCodeClient`（客户端）当 `dynamic` 占位用，所以按深层路径引 antd。
 */
export interface CodeSkeletonProps {
  /** 与真实编辑器等高，默认 600px。 */
  height?: number | string;
  /** 画多少行，默认 20。 */
  lines?: number;
  /** 已翻译好的无障碍文案，由调用方传入。 */
  label?: string;
  className?: string;
}

/** 代码行的宽度分布（30%~90%），刻意不规则，看起来才像代码而不是表格。 */
const LINE_WIDTHS = [
  62, 88, 41, 74, 55, 90, 33, 68, 47, 80, 59, 36, 71, 84, 44, 66, 52, 78, 39,
  61,
];

export function CodeSkeleton({
  height = 600,
  lines = 20,
  label,
  className = '',
}: CodeSkeletonProps) {
  const rows = Array.from({ length: lines }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="code-skeleton"
      style={{ height }}
      className={`overflow-hidden rounded-lg border border-app-primary bg-app-elevated theme-transition ${className}`.trim()}
    >
      <div className="flex h-full">
        <div className="flex w-10 shrink-0 flex-col gap-2 border-r border-app-primary px-2 py-3">
          {rows.map((i) => (
            <Skeleton.Input
              key={i}
              active
              size="small"
              style={{ width: 20, minWidth: 20, height: 12 }}
            />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3">
          {rows.map((i) => (
            <Skeleton.Input
              key={i}
              active
              size="small"
              style={{
                width: `${LINE_WIDTHS[i % LINE_WIDTHS.length]}%`,
                minWidth: 0,
                height: 12,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CodeSkeleton;
