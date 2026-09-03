import Skeleton from 'antd/es/skeleton';

/** 反馈列表每页 15 条，骨架也要画满 15 行，否则加载完页面会整体往下窜。 */
export const ISSUE_PAGE_SIZE = 15;

/**
 * 单条反馈的骨架。
 *
 * 形状贴住真实行：标题 + 状态 Tag 一行、标签行、20px 头像的元信息行，右侧评论数。
 * 通用的 `<Skeleton paragraph={{rows:6}}/>` 只有 ~200px，顶替 ~1300px 的列表必然跳。
 *
 * 没有 `'use client'`：既被 `loading.tsx`（服务端）用，也被列表客户端组件用，
 * 所以 antd 走深层路径。
 */
export default function IssueRowSkeleton() {
  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton.Input
              active
              size="small"
              style={{ width: 260, minWidth: 260, height: 24 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 56, minWidth: 56, height: 22 }}
            />
          </div>
          <div className="flex gap-1">
            <Skeleton.Button
              active
              size="small"
              style={{ width: 48, minWidth: 48, height: 20 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 48, minWidth: 48, height: 20 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton.Avatar active size={20} />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 200, minWidth: 200, height: 20 }}
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
export function IssueListSkeleton({
  count = ISSUE_PAGE_SIZE,
}: {
  count?: number;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="issue-list-skeleton"
      className="rounded-lg border border-app-primary bg-app-elevated theme-transition"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={
            index !== count - 1 ? 'border-b border-app-primary' : undefined
          }
        >
          <IssueRowSkeleton />
        </div>
      ))}
    </div>
  );
}
