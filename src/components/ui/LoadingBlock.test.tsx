/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LoadingBlock from './LoadingBlock';

afterEach(cleanup);

/**
 * `LoadingBlock` 存在的意义是「加载态不能是一个看不见的空洞」：
 * 它必须占住调用方声明的高度（避免 CLS），并且始终画出可见的骨架 / 转圈。
 */
describe('LoadingBlock', () => {
  it('按调用方声明的高度占位（数字按 px 处理）', () => {
    const { container } = render(<LoadingBlock height={420} />);
    const block = container.firstElementChild as HTMLElement;

    expect(block.style.height).toBe('420px');
  });

  it('高度支持字符串单位', () => {
    const { container } = render(<LoadingBlock height="60vh" />);
    const block = container.firstElementChild as HTMLElement;

    expect(block.style.height).toBe('60vh');
  });

  it('默认渲染 active 骨架屏，而不是空容器', () => {
    const { container } = render(<LoadingBlock height={200} />);

    expect(container.querySelector('.ant-skeleton')).not.toBeNull();
    expect(container.querySelector('.ant-skeleton-active')).not.toBeNull();
    expect(container.querySelector('.ant-spin')).toBeNull();
  });

  it('variant="spinner" 渲染居中的 Spin', () => {
    const { container } = render(
      <LoadingBlock height={200} variant="spinner" />,
    );

    expect(container.querySelector('.ant-spin')).not.toBeNull();
    expect(container.querySelector('.ant-skeleton')).toBeNull();
  });

  it('渲染调用方传入的已翻译文案', () => {
    render(
      <LoadingBlock height={200} variant="spinner" label="加载代码编辑器中…" />,
    );

    expect(screen.getByText('加载代码编辑器中…')).toBeInTheDocument();
  });

  it('未传 label 时不渲染任何文案节点', () => {
    const { container } = render(<LoadingBlock height={200} />);

    expect(container.textContent).toBe('');
  });

  it('沿用项目的主题化边框 / 背景，且可追加 className', () => {
    const { container } = render(
      <LoadingBlock height={200} className="mb-4" />,
    );
    const block = container.firstElementChild as HTMLElement;

    expect(block.className).toContain('border-app-primary');
    expect(block.className).toContain('bg-app-elevated');
    expect(block.className).toContain('theme-transition');
    expect(block.className).toContain('rounded-lg');
    expect(block.className).toContain('mb-4');
  });

  it('对辅助技术暴露加载状态', () => {
    const { container } = render(<LoadingBlock height={200} label="加载中…" />);
    const block = container.firstElementChild as HTMLElement;

    expect(block.getAttribute('role')).toBe('status');
    expect(block.getAttribute('aria-busy')).toBe('true');
  });
});
