import Skeleton from 'antd/es/skeleton';

/** 举报列表每页 15 条，骨架也要画满 15 行。 */
export const REPORT_PAGE_SIZE = 15;

/**
 * 单条举报的骨架。
 *
 * 举报行**没有标题**，只有「原因 Tag + 状态 Tag」和「#id + 20px 头像 + 时间」两行，
 * 所以比反馈行矮一截 —— 两边不能共用同一个骨架，否则加载完必然跳一次。
 *
 * 没有 `'use client'`：既被 `loading.tsx`（服务端）用，也被列表客户端组件用，
 * 所以 antd 走深层路径。
 */
export default function ReportRowSkeleton() {
  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton.Button
              active
              size="small"
              style={{ width: 72, minWidth: 72, height: 22 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 56, minWidth: 56, height: 22 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton.Button
              active
              size="small"
              style={{ width: 40, minWidth: 40, height: 20 }}
            />
            <Skeleton.Avatar active size={20} />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 180, minWidth: 180, height: 20 }}
            />
          </div>
        </div>
        <Skeleton.Input
          active
          size="small"
          style={{ width: 40, minWidth: 40, height: 20 }}
        />
      </div>
    </div>
  );
}

/** 整段列表骨架：带边框的容器 + 行间分隔线，与真实列表的外框完全一致。 */
export function ReportListSkeleton({
  count = REPORT_PAGE_SIZE,
}: {
  count?: number;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="report-list-skeleton"
      className="rounded-lg border border-app-primary bg-app-elevated theme-transition"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={
            index !== count - 1 ? 'border-b border-app-primary' : undefined
          }
        >
          <ReportRowSkeleton />
        </div>
      ))}
    </div>
  );
}
