import Card from 'antd/es/card';
import CodeSkeleton from './components/CodeSkeleton';

/**
 * 代码页的路由级加载态。
 *
 * `code/page.tsx` 在服务端 `await` 脚本源码（大脚本可能是几百 KB），
 * 没有 `loading.tsx` 时客户端路由切换会一直停在上一个 tab 上，看起来像点了没反应。
 * 这里先把「卡片 + 编辑器」的形状画出来，源码到达后原地替换。
 *
 * 服务端组件：antd 必须走深层路径，否则整个 barrel 会变成该路由的客户端引用。
 */
export default function ScriptCodeLoading() {
  return (
    <Card className="shadow-sm">
      <CodeSkeleton height={600} />
    </Card>
  );
}
