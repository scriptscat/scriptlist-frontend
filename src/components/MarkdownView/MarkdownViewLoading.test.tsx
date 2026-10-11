/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MarkdownViewLoading from './MarkdownViewLoading';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

afterEach(cleanup);

/**
 * `MarkdownView` 是 `dynamic()` 加载的，调用方不传 `loading` 时 fallback 是 `null`，
 * 客户端路由切换时正文区会塌成 0px。这个组件就是给那些 `dynamic()` 用的默认占位。
 */
describe('MarkdownViewLoading', () => {
  it('渲染有高度的可见占位，而不是 null', () => {
    const { container } = render(<MarkdownViewLoading />);
    const block = container.firstElementChild as HTMLElement;

    expect(block).not.toBeNull();
    expect(parseInt(block.style.height, 10)).toBeGreaterThanOrEqual(200);
    expect(container.querySelector('.ant-skeleton')).not.toBeNull();
  });

  it('高度可由调用方覆盖', () => {
    const { container } = render(<MarkdownViewLoading height={640} />);

    expect((container.firstElementChild as HTMLElement).style.height).toBe(
      '640px',
    );
  });
});
