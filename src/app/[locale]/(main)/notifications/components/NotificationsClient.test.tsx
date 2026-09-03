/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import NotificationsClient from './NotificationsClient';
import {
  useNotificationList,
  useUnreadCount,
} from '@/lib/api/hooks/notification';
import type { Notification } from '@/lib/api/services/notification';

vi.mock('@/lib/api/hooks/notification', () => ({
  useNotificationList: vi.fn(),
  useUnreadCount: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () =>
    Object.assign((key: string) => key, { rich: (key: string) => key }),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('@/lib/utils/semdate', () => ({
  useSemDateTime: () => (val: number) => String(val),
}));

const mockedList = vi.mocked(useNotificationList);
const mockedUnread = vi.mocked(useUnreadCount);

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
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
  mockedList.mockReset();
  mockedUnread.mockReset();
});

function notification(id: number, title: string): Notification {
  return {
    id,
    user_id: 1,
    type: 1,
    title,
    content: `content-${id}`,
    params: {},
    read_status: 2,
    createtime: 1700000000,
    updatetime: 1700000000,
  } as unknown as Notification;
}

const initialList = Array.from({ length: 20 }, (_, i) =>
  notification(i + 1, `title-${i + 1}`),
);

function renderClient(props: {
  initialList?: Notification[];
  initialTotal?: number;
}) {
  mockedUnread.mockReturnValue({ data: { total: 0 } } as never);
  return render(
    <NotificationsClient
      initialPage={1}
      initialList={props.initialList}
      initialTotal={props.initialTotal ?? 0}
    />,
  );
}

/**
 * 这一页原本是纯客户端冷启动：`page.tsx` 什么都不取，首屏必然是
 * `Skeleton paragraph={{ rows: 4 }}`——一个约 5 行高的小块，
 * 而真实数据是 20 行，卡片会在数据到达时暴涨一大截。
 */
describe('NotificationsClient 首屏', () => {
  it('有 SSR 数据时首屏直接画真实列表，不再出现骨架', () => {
    mockedList.mockReturnValue({
      data: { list: initialList, total: 20 },
      isLoading: false,
      isValidating: false,
    } as never);

    renderClient({ initialList, initialTotal: 20 });

    expect(screen.getByText('title-1')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-list-skeleton')).toBeNull();
  });

  it('SSR 取数失败时画 10 行通知形状的骨架，而不是 4 行段落', () => {
    mockedList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isValidating: true,
    } as never);

    renderClient({ initialList: undefined, initialTotal: 0 });

    const skeleton = screen.getByTestId('notification-list-skeleton');
    expect(
      skeleton.querySelectorAll(
        '[data-testid="notification-list-skeleton-item"]',
      ),
    ).toHaveLength(10);
  });
});

/**
 * 翻页 / 换筛选原本会把整个 `List` 换成骨架（`isLoading` 分支），
 * 用户正在看的内容当场消失。全局 `keepPreviousData` 让旧数据留在原地，
 * 这里只需要把它标成「正在刷新」：变暗 + 不可点。
 */
describe('NotificationsClient 翻页与筛选', () => {
  function refreshingAfterFirstPage() {
    mockedList.mockImplementation((params: unknown) => {
      const page = (params as { page?: number } | undefined)?.page ?? 1;
      return (
        page === 1
          ? {
              data: { list: initialList, total: 40 },
              isLoading: false,
              isValidating: false,
            }
          : {
              // keepPreviousData：换 key 时旧数据还在，只是 isValidating
              data: { list: initialList, total: 40 },
              isLoading: false,
              isValidating: true,
            }
      ) as never;
    });
  }

  it('翻页时旧列表留在原地并变暗、不可点', async () => {
    refreshingAfterFirstPage();
    renderClient({ initialList, initialTotal: 40 });

    fireEvent.click(screen.getByTitle('2'));

    await waitFor(() => {
      const content = screen.getByTestId('pending-results-content');
      expect(content.className).toContain('opacity-60');
      expect(content.className).toContain('pointer-events-none');
    });
    expect(screen.getByText('title-1')).toBeInTheDocument();
  });

  it('换筛选时也保持旧列表而不是清空', async () => {
    refreshingAfterFirstPage();
    renderClient({ initialList, initialTotal: 40 });

    fireEvent.click(screen.getByTitle('2'));

    await waitFor(() =>
      expect(screen.queryByTestId('notification-list-skeleton')).toBeNull(),
    );
  });
});
