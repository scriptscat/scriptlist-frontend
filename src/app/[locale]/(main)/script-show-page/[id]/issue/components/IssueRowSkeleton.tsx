import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
} from '@/components/ui/AntdSkeleton';

/** 反馈列表每页 15 条，骨架也要画满 15 行，否则加载完页面会整体往下窜。 */
export const ISSUE_PAGE_SIZE = 15;

/**
 * 单条反馈的骨架。
 *
 * 形状贴住真实行（`IssueRow`）：16px 状态图标、标题 + 内联标签一行、元信息一行，右侧回复数。
 * 通用的 `<Skeleton paragraph={{rows:6}}/>` 只有 ~200px，顶替整页列表必然跳。
 *
 * 没有 `'use client'`：既被 `loading.tsx`（服务端）用，也被列表客户端组件用，
 * 所以 antd 骨架元素统一通过适配层引入。
 */
export default function IssueRowSkeleton() {
  return (
    <div className="flex gap-2 px-4 py-2">
      <SkeletonAvatar active size={16} style={{ marginTop: 4 }} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <SkeletonInput
            active
            size="small"
            style={{ width: 260, minWidth: 260, height: 20, marginTop: 2 }}
          />
          <SkeletonButton
            active
            size="small"
            shape="round"
            style={{ width: 44, minWidth: 44, height: 18 }}
          />
        </div>
        <SkeletonInput
          active
          size="small"
          style={{ width: 200, minWidth: 200, height: 14 }}
        />
      </div>
      <SkeletonInput
        active
        size="small"
        style={{ width: 28, minWidth: 28, height: 16, marginTop: 4 }}
      />
    </div>
  );
}

/** 只有行的骨架：放进真实列表框（表头已就位）里，换筛选 / 翻页时用。 */
export function IssueRowsSkeleton({
  count = ISSUE_PAGE_SIZE,
}: {
  count?: number;
}) {
  return (
    <div role="status" aria-busy="true" data-testid="issue-rows-skeleton">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={index !== 0 ? 'border-t border-app-primary' : undefined}
        >
          <IssueRowSkeleton />
        </div>
      ))}
    </div>
  );
}

/** 整段列表骨架：带边框的容器 + 表头 + 行，与真实列表的外框完全一致（路由级 loading 用）。 */
export function IssueListSkeleton({
  count = ISSUE_PAGE_SIZE,
}: {
  count?: number;
}) {
  return (
    <div
      data-testid="issue-list-skeleton"
      className="overflow-hidden rounded-md border border-app-primary bg-app-elevated theme-transition"
    >
      <div className="flex items-center gap-4 border-b border-app-primary bg-app-primary px-4 py-2.5">
        <SkeletonInput
          active
          size="small"
          style={{ width: 96, minWidth: 96, height: 22 }}
        />
        <SkeletonInput
          active
          size="small"
          style={{ width: 96, minWidth: 96, height: 22 }}
        />
      </div>
      <IssueRowsSkeleton count={count} />
    </div>
  );
}
