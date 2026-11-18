'use client';

import type { Key, ReactNode } from 'react';
import { Empty, Modal, Pagination, Skeleton, Spin } from 'antd';
import AdminCard from './AdminCard';
import type { AdminCardSpec } from './AdminCard';
import { LoadFailedState } from './tableState';

export type {
  AdminCardAction,
  AdminCardField,
  AdminCardSpec,
} from './AdminCard';

const SKELETON_CARDS = 3;

export interface AdminResponsiveListPagination {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export interface AdminResponsiveListProps<T> {
  /** md 及以上原样渲染的 antd 表格 */
  table: ReactNode;
  rows: T[] | undefined;
  rowKey: keyof T | ((row: T) => Key);
  /** 一行数据到卡片各位置的映射 */
  card: (row: T) => AdminCardSpec;
  /** 屏幕上还没有任何行可画 */
  isLoading: boolean;
  /** 已有数据时的后台刷新 */
  isRefreshing?: boolean;
  error?: unknown;
  onRetry: () => void;
  pagination?: AdminResponsiveListPagination;
  /** 窄屏卡片列表上方的工具栏（表头筛选 / 排序的替代下拉框） */
  mobileToolbar?: ReactNode;
}

/**
 * 管理后台列表：md 及以上渲染原来的表格，窄屏每行渲染为一张卡片。
 *
 * 两种布局都输出到 HTML，用 CSS 断点切换，服务端与客户端的结构因此一致，不会水合不匹配。
 */
export function AdminResponsiveList<T>({
  table,
  rows,
  rowKey,
  card,
  isLoading,
  isRefreshing = false,
  error,
  onRetry,
  pagination,
  mobileToolbar,
}: AdminResponsiveListProps<T>) {
  const [modal, contextHolder] = Modal.useModal();
  const list = rows ?? [];
  const keyOf = (row: T): Key =>
    typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] as Key);

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div aria-busy="true" className="flex flex-col gap-3">
        {Array.from({ length: SKELETON_CARDS }, (_, i) => (
          <div
            key={i}
            className="rounded-lg border border-app-secondary bg-app-elevated p-3"
          >
            <Skeleton active title paragraph={{ rows: 2 }} />
          </div>
        ))}
      </div>
    );
  } else if (list.length === 0 && error) {
    content = <LoadFailedState onRetry={onRetry} />;
  } else if (list.length === 0) {
    content = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  } else {
    content = (
      <Spin spinning={isRefreshing}>
        <div className="flex flex-col gap-3">
          {list.map((row) => (
            <AdminCard
              key={keyOf(row)}
              spec={card(row)}
              confirm={modal.confirm}
            />
          ))}
        </div>
      </Spin>
    );
  }

  return (
    <>
      <div className="hidden md:block">{table}</div>
      <div className="md:hidden">
        {mobileToolbar && (
          <div className="mb-3 flex flex-col gap-2">{mobileToolbar}</div>
        )}
        {content}
        {pagination && !isLoading && list.length > 0 && (
          <Pagination
            className="mt-4 flex justify-center"
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={(page) => pagination.onChange(page)}
            showSizeChanger={false}
            showQuickJumper={false}
            showLessItems
          />
        )}
      </div>
      {contextHolder}
    </>
  );
}
