import Card from 'antd/es/card';
import {
  Skeleton,
  SkeletonButton,
  SkeletonInput,
} from '@/components/ui/AntdSkeleton';

/**
 * 反馈详情的路由级加载态。
 *
 * `issue/[issueId]/page.tsx` 在服务端并行取详情与评论列表。骨架保持真实页面的
 * 左右两栏（正文 3/4、侧栏 1/4）：标题、状态行、正文、两条评论、评论编辑器。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function IssueDetailLoading() {
  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex basis-3/4 flex-col gap-3 !w-3/4">
          <SkeletonInput
            active
            size="large"
            style={{ width: 420, minWidth: 420 }}
          />
          <div className="flex items-center gap-2">
            <SkeletonButton
              active
              size="small"
              style={{ width: 64, minWidth: 64, height: 22 }}
            />
            <SkeletonButton
              active
              size="small"
              style={{ width: 48, minWidth: 48, height: 22 }}
            />
            <SkeletonInput
              active
              size="small"
              style={{ width: 200, minWidth: 200, height: 20 }}
            />
          </div>
          <Skeleton active title={false} paragraph={{ rows: 6 }} />
          <div className="!mt-2 flex flex-col gap-6 border-t border-app-primary pt-4">
            {[0, 1].map((index) => (
              <Skeleton key={index} active avatar paragraph={{ rows: 3 }} />
            ))}
          </div>
          <div
            className="rounded-lg border border-app-primary bg-app-elevated theme-transition"
            style={{ height: 400 }}
          />
        </div>
        <div className="flex basis-1/4 flex-col gap-6">
          <Skeleton active title={{ width: 80 }} paragraph={{ rows: 1 }} />
          <Skeleton active title={{ width: 80 }} paragraph={{ rows: 1 }} />
          <Skeleton active title={{ width: 80 }} paragraph={{ rows: 1 }} />
        </div>
      </div>
    </Card>
  );
}
