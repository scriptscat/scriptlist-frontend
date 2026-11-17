import Card from 'antd/es/card';
import { SkeletonButton, SkeletonInput } from '@/components/ui/AntdSkeleton';
import { IssueListSkeleton } from './components/IssueRowSkeleton';

/**
 * 反馈列表的路由级加载态。
 *
 * `issue/page.tsx` 在服务端 `await` 反馈列表，导航到本页时这段时间是空白的。
 * 骨架保持与真实页面一致的两段结构：搜索栏 + 新建按钮，以及带状态表头、15 行的列表框。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function ScriptIssueLoading() {
  return (
    <Card className="shadow-sm">
      <div className="mx-auto">
        <div className="mb-4 flex gap-3">
          <SkeletonInput active block style={{ height: 32 }} />
          <SkeletonButton active style={{ width: 104, minWidth: 104 }} />
        </div>
        <IssueListSkeleton />
      </div>
    </Card>
  );
}
