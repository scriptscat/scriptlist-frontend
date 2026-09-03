import Card from 'antd/es/card';
import RatingListSkeleton from './components/rating/RatingListSkeleton';
import RatingOverviewSkeleton from './components/rating/RatingOverviewSkeleton';

/**
 * 评价页的路由级加载态。
 *
 * `comment/page.tsx` 在服务端串行 `await` 评分统计和第一页评价列表，
 * 没有 `loading.tsx` 时切到「评价」tab 会长时间停在上一页。
 * 这里按真实版式占位：概览块 + 三条评价行。
 *
 * 服务端组件：antd 走深层路径。
 */
export default function ScriptRatingLoading() {
  return (
    <Card className="shadow-sm">
      <div className="flex w-full flex-col gap-4">
        <RatingOverviewSkeleton />
        <RatingListSkeleton count={3} />
      </div>
    </Card>
  );
}
