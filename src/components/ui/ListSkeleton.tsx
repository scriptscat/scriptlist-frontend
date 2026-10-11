'use client';

import { Skeleton } from 'antd';

export interface ListSkeletonProps {
  /** 重复渲染的行数，默认 5。要贴近真实列表的条目数，别让 200px 的骨架顶替 1300px 的列表。 */
  count?: number;
  /** 每行的段落骨架行数，默认 2。 */
  rows?: number;
  /** 是否渲染头像占位，默认 false。 */
  avatar?: boolean;
  className?: string;
}

/** 单行的垂直内边距（上下各 16px）。 */
const ITEM_PADDING = 32;
/** 标题骨架的高度。 */
const ITEM_TITLE_HEIGHT = 24;
/** 每行段落骨架的高度（含行距）。 */
const ITEM_ROW_HEIGHT = 24;

/**
 * 列表加载骨架。
 *
 * 关键是**预留真实高度**：按 `count × 每行高度` 撑开容器，数据到达时不会出现
 * 「骨架很矮、真实列表很高」造成的整页跳动。
 */
export function ListSkeleton({
  count = 5,
  rows = 2,
  avatar = false,
  className = '',
}: ListSkeletonProps) {
  const minHeight = ITEM_PADDING + ITEM_TITLE_HEIGHT + rows * ITEM_ROW_HEIGHT;

  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="list-skeleton"
      className={`flex flex-col gap-3 ${className}`.trim()}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          data-testid="list-skeleton-item"
          style={{ minHeight }}
          className="border border-app-primary rounded-lg bg-app-elevated theme-transition p-4"
        >
          <Skeleton active avatar={avatar} title paragraph={{ rows }} />
        </div>
      ))}
    </div>
  );
}

export default ListSkeleton;
