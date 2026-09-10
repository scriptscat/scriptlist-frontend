import Card from 'antd/es/card';
import { Skeleton, SkeletonInput } from '@/components/ui/AntdSkeleton';

/**
 * 管理区的路由级加载态。
 *
 * 注意作用范围：`loading.tsx` 只包住同级的 `page` 及其子路由，**不包同级 layout**。
 * `manage/layout.tsx` → `ManageClientLayout` 的 250px 侧栏此时已经渲染好了，
 * 这里再画一条侧栏骨架会变成两条侧栏，所以只画右侧 Content 区：
 * 标题 + 描述 + 表格。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function ManageLoading() {
  return (
    <Card className="shadow-sm">
      <div className="mb-6 space-y-2">
        <SkeletonInput
          active
          size="large"
          style={{ width: 200, minWidth: 200 }}
        />
        <Skeleton active title={false} paragraph={{ rows: 1 }} />
      </div>
      {/* 统计条 */}
      <div className="mb-4 flex flex-wrap gap-6 p-4">
        {[0, 1, 2, 3].map((index) => (
          <SkeletonInput
            key={index}
            active
            size="small"
            style={{ width: 96, minWidth: 96, height: 20 }}
          />
        ))}
      </div>
      {/* 表格 */}
      <Skeleton active title={false} paragraph={{ rows: 8 }} />
    </Card>
  );
}
