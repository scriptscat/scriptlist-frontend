import Card from 'antd/es/card';
import Skeleton from 'antd/es/skeleton';

/**
 * 新建举报的路由级加载态。
 *
 * 没有这个文件的话，本段会落到上一级 `report/loading.tsx` 的 15 行列表骨架上。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function CreateReportLoading() {
  return (
    <Card>
      <div className="flex flex-row gap-3">
        <div className="flex basis-3/4 flex-col gap-2">
          <div
            className="rounded-lg border border-app-primary bg-app-elevated theme-transition"
            style={{ height: 400 }}
          />
          <div className="flex justify-end">
            <Skeleton.Button active style={{ width: 96, minWidth: 96 }} />
          </div>
        </div>
        <div className="flex basis-1/4 flex-col">
          <Skeleton active title={{ width: 80 }} paragraph={{ rows: 4 }} />
        </div>
      </div>
    </Card>
  );
}
