/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import NotificationBell from './NotificationBell';
import { useUnreadCount } from '@/lib/api/hooks/notification';

vi.mock('@/lib/api/hooks/notification', () => ({ useUnreadCount: vi.fn() }));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockedHook = vi.mocked(useUnreadCount);

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  mockedHook.mockReset();
});

function renderBell(total: number | undefined) {
  mockedHook.mockReturnValue({
    data: total === undefined ? undefined : { total },
  } as never);
  return render(<NotificationBell />);
}

/**
 * 未读数没有 SSR 种子：首屏一定是「还没取到」的状态，取到之后 Badge 才出现。
 * 铃铛占的格子必须在这两个状态下完全一样，数字才不可能挤到旁边的头像 / 按钮。
 */
describe('NotificationBell 占位', () => {
  it('未读数未到达时就已经占好固定尺寸的格子', () => {
    renderBell(undefined);

    const slot = screen.getByTestId('notification-bell-slot');
    expect(slot).toBeInTheDocument();
    expect(slot.className).toContain('w-6');
    expect(slot.className).toContain('h-6');
  });

  it('未读数到达前后，格子的尺寸类完全一致', () => {
    renderBell(undefined);
    const before = screen.getByTestId('notification-bell-slot').className;
    cleanup();

    renderBell(12);
    const after = screen.getByTestId('notification-bell-slot').className;

    expect(after).toBe(before);
  });

  it('未读数到达后渲染出角标数字', () => {
    renderBell(12);

    expect(screen.getByTitle('12')).toBeInTheDocument();
  });
});
