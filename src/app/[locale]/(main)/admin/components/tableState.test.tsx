/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Table } from 'antd';
import { useTableStateLocale } from './tableState';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

// antd 的响应式观察者要 matchMedia，jsdom 没有实现。
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

afterEach(cleanup);

function localeOf(opts: Parameters<typeof useTableStateLocale>[0]) {
  return renderHook(() => useTableStateLocale(opts)).result.current;
}

describe('useTableStateLocale', () => {
  // 加载中仍然画「暂无数据」的话，它会透过 antd loading 蒙层被读到，
  // 用户先看到一句「暂无数据」，一拍之后才变成真实数据。
  it('加载中不画空态文案，只留等高占位', () => {
    const locale = localeOf({ isLoading: true, onRetry: vi.fn() });
    const { container } = render(<>{locale.emptyText as React.ReactNode}</>);

    expect(container.textContent).toBe('');
    expect((container.firstElementChild as HTMLElement).style.height).not.toBe(
      '',
    );
  });

  it('失败时画错误文案 + 重试按钮，并标记为 alert', () => {
    const onRetry = vi.fn();
    const locale = localeOf({
      isLoading: false,
      error: new Error('boom'),
      onRetry,
    });
    const { container } = render(<>{locale.emptyText as React.ReactNode}</>);

    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(screen.getByText('components.loading.failed')).toBeInTheDocument();

    const retry = screen.getByText('components.loading.retry');
    fireEvent.click(retry.closest('button') as HTMLButtonElement);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('成功且为空时交回 antd 自带的空态', () => {
    const locale = localeOf({ isLoading: false, onRetry: vi.fn() });

    expect(locale.emptyText).toBeUndefined();
  });

  // 组合验证：首帧（加载中 + 无数据）不应该出现 antd 的默认空态插图。
  it('接到 Table 上时，首帧不出现默认空态', () => {
    function Demo() {
      const locale = useTableStateLocale({ isLoading: true, onRetry: vi.fn() });
      return (
        <Table
          rowKey="id"
          dataSource={[]}
          loading
          locale={locale}
          columns={[{ title: 'ID', dataIndex: 'id' }]}
        />
      );
    }
    const { container } = render(<Demo />);

    expect(container.querySelector('.ant-empty')).toBeNull();
    expect(container.querySelector('.ant-spin')).not.toBeNull();
  });
});
