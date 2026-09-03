'use client';

import { useMemo } from 'react';
import { Button, Empty } from 'antd';
import type { TableLocale } from 'antd/es/table/interface';
import { useTranslations } from 'next-intl';

/**
 * 加载中占位的高度。取「表格里几行数据」的量级，让加载态和有数据时的高度接近，
 * 数据到达时页面不会突然长高。
 */
const LOADING_PLACEHOLDER_HEIGHT = 160;

export interface TableStateOptions {
  /** 屏幕上还没有任何行可画。 */
  isLoading: boolean;
  /** 取数失败。为空表示成功。 */
  error?: unknown;
  /** 重试回调，通常是 hook 返回的 `refresh`。 */
  onRetry: () => void;
}

/**
 * 管理后台表格的空态 / 错误态文案。
 *
 * 解决两件事：
 *
 * 1. **加载中不画「暂无数据」。** antd 的 `loading` 是一层蒙层，底下的空态插图仍然
 *    可读，用户会先看到一句「暂无数据」再看到数据。加载中改画一块等高的透明占位。
 * 2. **失败不再是永久空表。** 原本失败只弹 3 秒 toast，表格随后永远停在「暂无数据」，
 *    没有任何重试入口；非 `APIError`（断网、20 秒超时）连 toast 都没有。
 *    这里把失败画成带重试按钮的 `Empty`。
 *
 * 成功且为空时返回 `{}`，交回 antd 自己的「暂无数据」。
 */
export function useTableStateLocale({
  isLoading,
  error,
  onRetry,
}: TableStateOptions): TableLocale {
  const t = useTranslations('components.loading');

  return useMemo(() => {
    if (isLoading) {
      return {
        emptyText: (
          <div aria-hidden style={{ height: LOADING_PLACEHOLDER_HEIGHT }} />
        ),
      };
    }

    if (error) {
      return {
        emptyText: (
          <div role="alert">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('failed')}
            >
              <Button size="small" onClick={onRetry}>
                {t('retry')}
              </Button>
            </Empty>
          </div>
        ),
      };
    }

    return {};
  }, [isLoading, error, onRetry, t]);
}
