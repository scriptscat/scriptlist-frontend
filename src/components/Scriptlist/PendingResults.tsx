'use client';

import type { ReactNode } from 'react';
import { Progress } from 'antd';

export interface PendingResultsProps {
  /** 是否正在取新的一页 / 新的筛选结果。 */
  pending: boolean;
  /** 已翻译好的状态文案，只播报给读屏软件，不占版面。 */
  label: string;
  children: ReactNode;
  /** 附加在内容层上的布局 class（外层只负责定位，不参与排版）。 */
  className?: string;
}

/**
 * 结果区的「刷新中」外壳。
 *
 * 翻页、改筛选、换排序都走 `router.push`（编程式导航），而
 * `NavigationProgress` 里的 `nextjs-toploader` 只在 document 上监听 `<a>` 点击，
 * 因此这类跳转**没有**全局顶部进度条；不自己画，用户点了页码后屏幕毫无变化。
 *
 * 做法遵循 `docs/design.md` 的「刷新用 spin、首屏才用骨架」：旧结果保持挂载
 * （不闪空、不塌高度），变暗且不可点表示已受理，顶部一条 2px 细条表示进行中。
 * 相比整块居中的大转圈，细条不会遮住用户正在看的那一屏内容。
 */
export default function PendingResults({
  pending,
  label,
  children,
  className = '',
}: PendingResultsProps) {
  return (
    <div className="relative" data-testid="pending-results" aria-busy={pending}>
      {pending && (
        <div
          role="status"
          data-testid="pending-results-bar"
          className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        >
          <Progress
            percent={100}
            status="active"
            showInfo={false}
            size={['100%', 2]}
            strokeLinecap="butt"
          />
          <span className="sr-only">{label}</span>
        </div>
      )}
      <div
        data-testid="pending-results-content"
        className={`${
          pending
            ? 'opacity-60 pointer-events-none transition-opacity duration-200'
            : 'transition-opacity duration-200'
        } ${className}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
