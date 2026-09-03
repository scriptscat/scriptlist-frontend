import Card from 'antd/es/card';
import Skeleton from 'antd/es/skeleton';
import CodeSkeleton from '../code/components/CodeSkeleton';

/**
 * 版本对比页的路由级加载态。
 *
 * `diff/page.tsx` 在服务端 `await` **两份**脚本源码，是本页面组里服务端等待最久的一段；
 * 而且它的主要入口是版本页上的「对比」按钮（客户端跳转），
 * 没有 `loading.tsx` 时用户点完按钮会在版本页上干等。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function ScriptDiffLoading() {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton.Input
            active
            size="small"
            style={{ width: 120, minWidth: 120, height: 24 }}
          />
          <div className="flex items-center gap-2">
            <Skeleton.Button
              active
              size="small"
              style={{ width: 72, minWidth: 72 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 72, minWidth: 72 }}
            />
          </div>
        </div>
        <CodeSkeleton height={600} />
      </Card>
    </div>
  );
}
