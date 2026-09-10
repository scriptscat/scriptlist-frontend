import {
  Skeleton,
  SkeletonButton,
  SkeletonInput,
} from '@/components/ui/AntdSkeleton';

/**
 * 版本列表的加载骨架。
 *
 * 每一行按真实条目排布：版本号胶囊（90px）+ 日期条（60px）+ 两行更新说明
 * （100% / 60%）+ 右下角的操作按钮块（32px）。行高与真实条目对齐，
 * 翻页时列表区不会从 N×150px 塌到 96px。
 *
 * 没有 `'use client'`：`version/loading.tsx`（服务端）与
 * `ScriptVersionsClient`（客户端）共用，所以通过适配层引入 antd。
 */
export interface VersionListSkeletonProps {
  /** 行数，默认 10（与默认每页条数一致）。 */
  count?: number;
  /** 已翻译好的无障碍文案。 */
  label?: string;
  className?: string;
}

export function VersionListSkeleton({
  count = 10,
  label,
  className = '',
}: VersionListSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="version-list-skeleton"
      className={`divide-y divide-gray-100 dark:divide-gray-800 ${className}`.trim()}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          data-testid="version-list-skeleton-item"
          className="space-y-3 py-5 first:pt-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SkeletonButton
              active
              size="small"
              style={{ width: 90, minWidth: 90 }}
            />
            <SkeletonInput
              active
              size="small"
              style={{ width: 60, minWidth: 60, height: 16 }}
            />
          </div>
          <div className="border-l-[3px] border-gray-200 pl-3 dark:border-gray-700">
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 2, width: ['100%', '60%'] }}
            />
          </div>
          <div className="flex justify-end">
            <SkeletonButton
              active
              size="small"
              style={{ width: 32, minWidth: 32 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default VersionListSkeleton;
