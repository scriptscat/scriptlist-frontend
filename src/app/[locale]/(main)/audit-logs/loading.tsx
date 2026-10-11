import Card from 'antd/es/card';
import { Skeleton, SkeletonInput } from '@/components/ui/AntdSkeleton';

/**
 * 管理日志页的路由级加载态。
 *
 * `audit-logs/page.tsx` 在服务端先 `await userService.getCurrentUser()`（还可能
 * 因未登录而重定向），再 `await auditLogService.list()`，这段时间整页是空白的。
 * 骨架按真实页面的三段结构画：标题、副标题、四列表格，
 * 列宽与 `AuditLogList` 的 `columns` 一致（180 / 150 / 250 / 自适应），
 * 行数与每页条数一致（20 条里先画 10 行，足够撑住首屏高度）。
 *
 * 服务端组件：antd 骨架元素统一通过 AntdSkeleton 适配层引入。
 */
const ROW_COUNT = 10;

/** 与 AuditLogList 的 columns 对齐：时间 180、操作者 150、目标 250、原因自适应。 */
const COLUMNS = [
  { width: 180, contentWidth: 140 },
  { width: 150, contentWidth: 88 },
  { width: 250, contentWidth: 190 },
  { width: 0, contentWidth: 0 },
] as const;

function HeaderCell({ index }: { index: number }) {
  const column = COLUMNS[index];
  return (
    <div
      className={column.width ? 'shrink-0' : 'min-w-0 flex-1'}
      style={column.width ? { width: column.width } : undefined}
    >
      <SkeletonInput
        active
        size="small"
        style={{ width: column.width ? 64 : '35%', minWidth: 48, height: 16 }}
      />
    </div>
  );
}

function BodyCell({ index, row }: { index: number; row: number }) {
  const column = COLUMNS[index];
  // 自适应列画成随行变化的宽度，避免整张表看起来像一堵等宽的墙。
  const flexWidths = ['72%', '46%', '88%', '58%'];
  return (
    <div
      className={column.width ? 'shrink-0' : 'min-w-0 flex-1'}
      style={column.width ? { width: column.width } : undefined}
    >
      <SkeletonInput
        active
        size="small"
        style={{
          width: column.width
            ? column.contentWidth
            : flexWidths[row % flexWidths.length],
          minWidth: column.width ? column.contentWidth : 0,
          height: 16,
        }}
      />
    </div>
  );
}

export default function AuditLogsLoading() {
  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Card className="shadow-sm">
        <div className="mb-6 space-y-2">
          <SkeletonInput
            active
            size="large"
            style={{ width: 180, minWidth: 180 }}
          />
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 1, width: '46%' }}
          />
        </div>

        <div
          role="status"
          aria-busy="true"
          data-testid="audit-logs-table-skeleton"
          className="rounded-lg border border-app-primary theme-transition"
        >
          <div className="flex items-center gap-4 border-b border-app-primary bg-app-secondary px-4 py-3">
            {COLUMNS.map((_, index) => (
              <HeaderCell key={index} index={index} />
            ))}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: ROW_COUNT }, (_, row) => (
              <div
                key={row}
                data-testid="audit-logs-table-skeleton-row"
                className="flex items-center gap-4 px-4 py-3"
              >
                {COLUMNS.map((_, index) => (
                  <BodyCell key={index} index={index} row={row} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
