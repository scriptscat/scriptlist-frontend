/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ChatMessagesSkeleton, ChatSidebarSkeleton } from './ChatSkeletons';

afterEach(cleanup);

describe('ChatSidebarSkeleton', () => {
  it('渲染 6 行、与 .chat-history-item 同样的 py-2.5 行高', () => {
    render(<ChatSidebarSkeleton label="加载中" />);

    const rows = screen.getAllByTestId('chat-sidebar-skeleton-row');
    expect(rows).toHaveLength(6);
    expect(rows[0].className).toContain('py-2.5');
  });

  it('对读屏软件播报加载状态', () => {
    render(<ChatSidebarSkeleton label="加载中" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('ChatMessagesSkeleton', () => {
  it('渲染 3 个左右交替的气泡', () => {
    render(<ChatMessagesSkeleton label="加载中" />);

    const bubbles = screen.getAllByTestId('chat-messages-skeleton-bubble');
    expect(bubbles).toHaveLength(3);
    expect(bubbles[0].className).toContain('flex-row');
    expect(bubbles[1].className).toContain('flex-row-reverse');
    expect(bubbles[2].className).toContain('flex-row');
  });

  it('头像占位与 ChatBubble 的 34px Avatar 等大，避免数据到达时跳动', () => {
    render(<ChatMessagesSkeleton label="加载中" />);

    const avatar = screen.getAllByTestId('chat-messages-skeleton-bubble')[0]
      .firstElementChild as HTMLElement;
    expect(avatar.style.width).toBe('34px');
    expect(avatar.style.height).toBe('34px');
  });
});
