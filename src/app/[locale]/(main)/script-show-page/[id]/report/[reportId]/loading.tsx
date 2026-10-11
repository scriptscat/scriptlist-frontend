import Card from 'antd/es/card';
import {
  Skeleton,
  SkeletonButton,
  SkeletonInput,
} from '@/components/ui/AntdSkeleton';

/**
 * 举报详情的路由级加载态。
 *
 * 与反馈详情的区别：举报没有标题，第一行是「原因 Tag + 状态 Tag」。
 * 不写这个文件的话会落到 `report/loading.tsx` 的列表骨架上，形状完全对不上。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function ReportDetailLoading() {
  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex basis-3/4 flex-col gap-3 !w-3/4">
          <div className="flex items-center gap-2">
            <SkeletonButton
              active
              size="small"
              style={{ width: 72, minWidth: 72, height: 22 }}
            />
            <SkeletonButton
              active
              size="small"
              style={{ width: 56, minWidth: 56, height: 22 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonButton
              active
              size="small"
              style={{ width: 40, minWidth: 40, height: 20 }}
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
        </div>
      </div>
    </Card>
  );
}
