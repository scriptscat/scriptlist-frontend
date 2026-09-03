import Card from 'antd/es/card';
import Skeleton from 'antd/es/skeleton';

/**
 * 收藏夹详情页的路由级加载态。
 *
 * 这一页最常见的入口是别人分享出去的收藏夹链接，也就是**冷进入**：
 * `page.tsx` 要先 `await getFolderDetail`，再并行 `await` 用户信息与脚本列表，
 * 三个请求全部返回前屏幕上什么都没有。骨架按真实页面画：
 * 面包屑 → 收藏夹信息卡（标题 + 公开/私有标签 + 描述 + 脚本数）→ 8 张脚本卡
 * （48px 图标 + 两行文字 + 标签行），高度与真实内容接近，数据到达时不会整页跳动。
 *
 * 服务端组件：antd 走深层路径。
 */
const SCRIPT_CARD_COUNT = 8;

/** 每张卡的标题宽度刻意不同，避免 8 张卡看起来像一张重复的条纹图。 */
const TITLE_WIDTHS = ['52%', '38%', '61%', '45%', '57%', '34%', '49%', '66%'];

export default function FolderDetailLoading() {
  return (
    <div role="status" aria-busy="true" data-testid="folder-detail-skeleton">
      {/* 面包屑 */}
      <div className="mb-3">
        <Skeleton.Input
          active
          size="small"
          style={{ width: 320, minWidth: 320, height: 18 }}
        />
      </div>

      {/* 收藏夹信息卡 */}
      <Card className="!mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton.Input
                active
                size="large"
                style={{ width: 240, minWidth: 240 }}
              />
              <Skeleton.Button
                active
                size="small"
                style={{ width: 72, minWidth: 72 }}
              />
            </div>
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 1, width: '72%' }}
            />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 120, minWidth: 120, height: 16 }}
            />
          </div>
          <Skeleton.Button
            active
            style={{ width: 120, minWidth: 120 }}
            className="shrink-0"
          />
        </div>
      </Card>

      {/* 脚本卡列表 */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: SCRIPT_CARD_COUNT }, (_, index) => (
          <Card key={index} data-testid="folder-detail-skeleton-card">
            <div className="flex items-start gap-4">
              <Skeleton.Avatar active shape="square" size={48} />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton.Input
                  active
                  size="small"
                  style={{
                    width: TITLE_WIDTHS[index % TITLE_WIDTHS.length],
                    minWidth: 0,
                    height: 20,
                  }}
                />
                <Skeleton
                  active
                  title={false}
                  paragraph={{ rows: 2, width: ['100%', '64%'] }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 56, minWidth: 56 }}
                  />
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 72, minWidth: 72 }}
                  />
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 64, minWidth: 64 }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
