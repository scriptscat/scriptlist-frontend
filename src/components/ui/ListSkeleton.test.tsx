/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ListSkeleton from './ListSkeleton';

afterEach(cleanup);

function items(container: HTMLElement) {
  return container.querySelectorAll('[data-testid="list-skeleton-item"]');
}

/**
 * 列表骨架要修的 bug 是「200px 的骨架顶替 1300px 的真实列表」：
 * 行数与每行高度都必须撑出接近真实列表的高度，否则加载完成时页面会整体跳动。
 */
describe('ListSkeleton', () => {
  it('默认渲染 5 行骨架', () => {
    const { container } = render(<ListSkeleton />);

    expect(items(container)).toHaveLength(5);
  });

  it('按 count 渲染指定行数', () => {
    const { container } = render(<ListSkeleton count={12} />);

    expect(items(container)).toHaveLength(12);
  });

  it('每行都是 active 骨架，不是空 div', () => {
    const { container } = render(<ListSkeleton count={3} />);

    expect(container.querySelectorAll('.ant-skeleton-active')).toHaveLength(3);
  });

  it('默认每行 2 段文本骨架，可通过 rows 调整', () => {
    const { container: byDefault } = render(<ListSkeleton count={1} />);
    expect(
      byDefault.querySelectorAll('.ant-skeleton-paragraph > li'),
    ).toHaveLength(2);

    cleanup();

    const { container: withRows } = render(<ListSkeleton count={1} rows={4} />);
    expect(
      withRows.querySelectorAll('.ant-skeleton-paragraph > li'),
    ).toHaveLength(4);
  });

  it('默认不渲染头像，avatar 开启后渲染', () => {
    const { container: noAvatar } = render(<ListSkeleton count={2} />);
    expect(noAvatar.querySelectorAll('.ant-skeleton-avatar')).toHaveLength(0);

    cleanup();

    const { container: withAvatar } = render(<ListSkeleton count={2} avatar />);
    expect(withAvatar.querySelectorAll('.ant-skeleton-avatar')).toHaveLength(2);
  });

  it('每行预留真实列表项的高度，行数越多预留越高', () => {
    const { container } = render(<ListSkeleton count={1} />);
    const item = items(container)[0] as HTMLElement;
    const twoRows = parseInt(item.style.minHeight, 10);

    expect(twoRows).toBeGreaterThanOrEqual(96);

    cleanup();

    const { container: tall } = render(<ListSkeleton count={1} rows={5} />);
    const tallItem = items(tall)[0] as HTMLElement;

    expect(parseInt(tallItem.style.minHeight, 10)).toBeGreaterThan(twoRows);
  });

  it('可追加 className', () => {
    const { container } = render(<ListSkeleton className="mt-6" />);

    expect((container.firstElementChild as HTMLElement).className).toContain(
      'mt-6',
    );
  });
});
