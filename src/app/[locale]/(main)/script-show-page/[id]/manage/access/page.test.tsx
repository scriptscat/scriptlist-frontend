/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import AccessPage from './page';
import { useAccessRoleList } from '@/lib/api/hooks';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.has = () => true;
    return t;
  },
  useLocale: () => 'zh-CN',
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, ...rest }: any) => <a {...rest}>{children}</a>,
}));

vi.mock('@/components/ScriptInvite/UserModal', () => ({
  UserModal: () => null,
}));

vi.mock('@/lib/api/services/scripts', () => ({
  scriptAccessService: {
    updateAccessRole: vi.fn(),
    deleteAccess: vi.fn(),
  },
}));

vi.mock('@/lib/api/hooks', () => ({
  useAccessRoleList: vi.fn(),
}));

// antd 在 jsdom 里首次渲染要现算 CSS-in-JS，单次 render 就能超过默认的 5s。
vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 });

const mockedUseAccessRoleList = vi.mocked(useAccessRoleList);

function item(id: number) {
  return {
    id,
    link_id: id,
    name: `entity-${id}`,
    avatar: '',
    type: 1,
    role: 'guest',
    invite_status: 1,
    expiretime: 0,
    createtime: 1700000000,
  };
}

/**
 * 服务端分页：总数 25、每页 20，接口一次只返回一页。
 * 这里每页只放 3 条 —— antd Table 在 `dataSource.length < total` 时不会自己再切片，
 * 行数少一点能让 jsdom 里的渲染快很多。
 */
const PAGE_ONE = Array.from({ length: 3 }, (_, i) => item(i + 1));
const PAGE_TWO = Array.from({ length: 3 }, (_, i) => item(i + 21));
const TOTAL = 25;

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

beforeEach(() => {
  mockedUseAccessRoleList.mockReset();
  mockedUseAccessRoleList.mockImplementation(((_id: number, page: number) => ({
    data: {
      list: page === 1 ? PAGE_ONE : PAGE_TWO,
      total: TOTAL,
    },
    isLoading: false,
    mutate: vi.fn(),
  })) as unknown as typeof useAccessRoleList);
});

afterEach(cleanup);

/**
 * 访问权限表格的翻页曾经是坏的：`useAccessRoleList(id, 1)` 把页码写死成 1，
 * 而 `Pagination` 只拿到服务端 `total`、没有 `current` / `onChange`。
 * 超过 20 条时点第 2 页会渲染出一张真正空的表 —— 还带着「暂无权限，去添加」的引导，
 * 用户会以为权限被清空了。
 */
describe('AccessPage 分页', () => {
  it('首屏请求第 1 页', () => {
    render(<AccessPage />);

    expect(mockedUseAccessRoleList).toHaveBeenCalledWith(1, 1);
  });

  it('点击第 2 页时按第 2 页请求，并渲染第 2 页的数据', () => {
    const { container } = render(<AccessPage />);

    expect(screen.getByText('entity-1')).toBeInTheDocument();

    const secondPage = container.querySelector(
      '.ant-pagination-item-2',
    ) as HTMLElement;
    expect(secondPage).not.toBeNull();
    fireEvent.click(secondPage);

    expect(mockedUseAccessRoleList).toHaveBeenLastCalledWith(1, 2);
    expect(screen.getByText('entity-21')).toBeInTheDocument();
    expect(screen.queryByText('entity-1')).not.toBeInTheDocument();
  });

  it('翻页后不再显示「暂无权限」引导', () => {
    const { container } = render(<AccessPage />);

    fireEvent.click(
      container.querySelector('.ant-pagination-item-2') as HTMLElement,
    );

    expect(screen.queryByText('empty.title')).not.toBeInTheDocument();
  });
});

/**
 * 统计块过去被 `total > 0` 整个包住：加载时完全不存在，数据到达后突然出现并把表格推下去。
 * 现在无论加载与否都占位，`总数` 取服务端 total（而不是当前页条数）。
 */
describe('AccessPage 统计块', () => {
  it('加载中也渲染统计块，避免数据到达时把表格推下去', () => {
    mockedUseAccessRoleList.mockImplementation((() => ({
      data: undefined,
      isLoading: true,
      mutate: vi.fn(),
    })) as unknown as typeof useAccessRoleList);

    render(<AccessPage />);

    expect(screen.getByText('stats.total')).toBeInTheDocument();
  });

  it('总数取服务端 total，而不是当前页的条数', () => {
    render(<AccessPage />);

    expect(screen.getByTestId('access-stats-total')).toHaveTextContent(
      String(TOTAL),
    );
  });

  it('加载中不显示「暂无权限」引导', () => {
    mockedUseAccessRoleList.mockImplementation((() => ({
      data: undefined,
      isLoading: true,
      mutate: vi.fn(),
    })) as unknown as typeof useAccessRoleList);

    render(<AccessPage />);

    expect(screen.queryByText('empty.title')).not.toBeInTheDocument();
  });
});
