/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar, { SearchSubmitButton } from './SearchBar';

const push = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({ push }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

afterEach(() => {
  cleanup();
  push.mockReset();
});

/**
 * 搜索是站内最主要的入口，提交走的是 `router.push`（编程式导航）。
 * `NavigationProgress` 包的 `nextjs-toploader` 只在 document 上监听 `<a>` 点击，
 * 编程式跳转不会有任何全局进度条——所以这里必须自己给出「已受理」的反馈，
 * 否则用户会反复回车 / 点击。
 */
describe('SearchSubmitButton', () => {
  it('空闲时渲染箭头，可点击', () => {
    render(
      <SearchSubmitButton pending={false} onClick={() => {}} label="搜索" />,
    );

    const button = screen.getByRole('button', { name: '搜索' });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(button.querySelector('.anticon-loading')).toBeNull();
  });

  it('提交进行中时换成转圈、禁用并标记 aria-busy', () => {
    render(<SearchSubmitButton pending onClick={() => {}} label="搜索" />);

    const button = screen.getByRole('button', { name: '搜索' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('.anticon-loading')).not.toBeNull();
  });

  it('pending 时不再触发点击', () => {
    const onClick = vi.fn();
    render(<SearchSubmitButton pending onClick={onClick} label="搜索" />);

    fireEvent.click(screen.getByRole('button', { name: '搜索' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('SearchBar', () => {
  it('点击提交按钮跳到搜索结果页', () => {
    render(<SearchBar initialKeyword="tampermonkey" />);

    fireEvent.click(screen.getByRole('button', { name: 'search.button' }));

    expect(push).toHaveBeenCalledWith('/search?keyword=tampermonkey');
  });

  it('回车提交同样跳转', () => {
    render(<SearchBar initialKeyword="abc" />);

    fireEvent.keyDown(screen.getByRole('textbox'), {
      key: 'Enter',
      keyCode: 13,
    });

    expect(push).toHaveBeenCalledWith('/search?keyword=abc');
  });

  it('搜索区域整体带 aria-busy，供读屏软件播报', () => {
    const { container } = render(<SearchBar />);

    expect(
      container.querySelector('[data-testid="search-bar"]'),
    ).toHaveAttribute('aria-busy', 'false');
  });
});
