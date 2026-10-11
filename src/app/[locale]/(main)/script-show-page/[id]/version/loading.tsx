import Card from 'antd/es/card';
import { Skeleton, SkeletonInput } from '@/components/ui/AntdSkeleton';
import VersionListSkeleton from './components/VersionListSkeleton';

/**
 * 版本页的路由级加载态。
 *
 * `version/page.tsx` 在服务端并行 `await` 版本列表与版本统计。
 * 骨架保持与真实页面一致的三段结构：标题、统计条、10 行版本列表，
 * 数据到达时不会整块跳动。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function ScriptVersionsLoading() {
  return (
    <Card className="shadow-sm !mb-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <SkeletonInput
            active
            size="large"
            style={{ width: 180, minWidth: 180 }}
          />
          <Skeleton active title={false} paragraph={{ rows: 1 }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
          <SkeletonInput
            active
            size="small"
            style={{ width: 240, minWidth: 240, height: 20 }}
          />
          <SkeletonInput
            active
            size="small"
            style={{ width: 140, minWidth: 140, height: 20 }}
          />
        </div>
        <VersionListSkeleton count={10} />
      </div>
    </Card>
  );
}
