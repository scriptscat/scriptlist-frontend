/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import AuditLogList from './AuditLogList';
import type { AuditLogItem } from '@/lib/api/services/auditLog';
import { useAuditLogList } from '@/lib/api/hooks/auditLog';

vi.mock('@/lib/api/hooks/auditLog', () => ({ useAuditLogList: vi.fn() }));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/lib/utils/semdate', () => ({
  useSemDateTime: () => (val: number) => String(val),
}));

const mockedHook = vi.mocked(useAuditLogList);

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

const initialList = [
  {
    id: 1,
    user_id: 9,
    username: 'alice',
    target_id: 101,
    target_name: 'script-a',
    reason: 'because',
    createtime: 1700000000,
  },
] as unknown as AuditLogItem[];

/** 翻页后接口还在飞：SWR 还没数据，`data` 是 undefined。 */
function fetchingSecondPage() {
  mockedHook.mockImplementation((params: unknown) =>
    params === null
      ? ({ data: undefined, isLoading: false, isValidating: false } as never)
      : ({ data: undefined, isLoading: true, isValidating: true } as never),
  );
}

function renderList() {
  return render(
    <AuditLogList
      initialPage={1}
      initialList={initialList}
      initialTotal={100}
    />,
  );
}

/**
 * 旧实现里 `displayTotal = paramsChanged ? (data?.total ?? 0) : initialTotal`：
 * 翻页那一刻 `data` 还是 undefined，于是 total 掉成 0——分页器塌成一页，
 * 用户当场失去自己所在的位置，表格同时闪出 antd 的「暂无数据」插画。
 */
describe('AuditLogList 翻页', () => {
  it('翻页加载中时 total 不会掉成 0，分页器保持原有页数', () => {
    fetchingSecondPage();
    renderList();

    // 100 条 / 每页 20 => 5 页，第 5 页的页码必须还在。
    fireEvent.click(screen.getByTitle('2'));

    expect(screen.getByTitle('5')).toBeInTheDocument();
  });

  it('翻页加载中不显示空数据插画，旧的行留在原地', () => {
    fetchingSecondPage();
    const { container } = renderList();

    fireEvent.click(screen.getByTitle('2'));

    expect(container.querySelector('.ant-empty')).toBeNull();
    expect(screen.getByText('script-a')).toBeInTheDocument();
  });

  it('翻页加载中表格进入 loading 态', async () => {
    fetchingSecondPage();
    const { container } = renderList();

    fireEvent.click(screen.getByTitle('2'));

    // antd 6 的 Spin 内部用 debounce 切换 spinning 状态，所以要等一拍。
    await waitFor(() =>
      expect(container.querySelector('.ant-spin-spinning')).not.toBeNull(),
    );
  });

  it('新数据到达后展示新的一页与新的总数', () => {
    const nextList = [
      {
        id: 2,
        user_id: 8,
        username: 'bob',
        target_id: 102,
        target_name: 'script-b',
        reason: '',
        createtime: 1700000001,
      },
    ] as unknown as AuditLogItem[];
    mockedHook.mockImplementation((params: unknown) =>
      params === null
        ? ({ data: undefined, isLoading: false, isValidating: false } as never)
        : ({
            data: { list: nextList, total: 40 },
            isLoading: false,
            isValidating: false,
          } as never),
    );
    renderList();

    fireEvent.click(screen.getByTitle('2'));

    expect(screen.getByText('script-b')).toBeInTheDocument();
    expect(screen.queryByTitle('5')).toBeNull();
  });
});
