import Card from 'antd/es/card';
import { SkeletonButton } from '@/components/ui/AntdSkeleton';
import { ReportListSkeleton } from './components/ReportRowSkeleton';

/**
 * 举报列表的路由级加载态。
 *
 * 结构与真实页面一致：右对齐的状态筛选栏，以及 15 行带边框的列表。
 * 举报行没有标题，骨架比反馈行矮一截 —— 两边不共用。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function ScriptReportLoading() {
  return (
    <Card className="shadow-sm">
      <div className="mx-auto">
        <div className="mb-4 flex justify-end gap-3">
          <SkeletonButton active style={{ width: 220, minWidth: 220 }} />
        </div>
        <ReportListSkeleton />
      </div>
    </Card>
  );
}
