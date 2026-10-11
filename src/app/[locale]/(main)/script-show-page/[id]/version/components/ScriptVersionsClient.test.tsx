/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import ScriptVersionsClient from './ScriptVersionsClient';
import type { ScriptVersion } from '@/lib/api/services/scripts/scripts';
import { EnablePreRelease } from '@/lib/api/services/scripts/scripts';

// antd 的 Pagination / Grid 会订阅 matchMedia，jsdom 未实现它。
beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

const scriptMock = {
  id: 7,
  name: 'demo',
  public: 1,
  user_id: 1,
};

vi.mock('../../components/ScriptContext', () => ({
  useScript: () => ({ script: scriptMock }),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/ScriptInstallGuide', () => ({
  useScriptInstallGuide: () => ({
    handleInstallClick: vi.fn(),
    guideModal: null,
  }),
}));

vi.mock('@/lib/utils/semdate', () => ({
  useSemDateTime: () => () => '2026-01-01',
}));

const useScriptInstallTokenMock = vi.fn();
vi.mock('@/lib/api/hooks/script', () => ({
  useScriptInstallToken: (...args: unknown[]) =>
    useScriptInstallTokenMock(...args),
}));

const getVersionListMock = vi.fn();
vi.mock('@/lib/api/services/scripts/scripts', () => ({
  EnablePreRelease: {
    EnablePreReleaseScript: 1,
    DisablePreReleaseScript: 2,
  },
  scriptService: {
    getVersionList: (...args: unknown[]) => getVersionListMock(...args),
    updateVersion: vi.fn(),
    deleteVersion: vi.fn(),
  },
}));

function makeVersion(id: number): ScriptVersion {
  return {
    id,
    user_id: 1,
    username: 'tester',
    script_id: 1,
    version: `1.0.${id}`,
    changelog: '',
    createtime: 0,
    is_pre_release: EnablePreRelease.DisablePreReleaseScript,
    status: 1,
  };
}

const page1 = {
  list: Array.from({ length: 10 }, (_, i) => makeVersion(i + 1)),
  total: 25,
};

beforeEach(() => {
  useScriptInstallTokenMock.mockReset();
  useScriptInstallTokenMock.mockReturnValue({
    data: undefined,
    isLoading: false,
  });
  getVersionListMock.mockReset();
  scriptMock.public = 1;
});

afterEach(cleanup);

// antd 的 Pagination + 10 行列表在 jsdom 下渲染很慢，默认 5s 不够。
const SLOW = 60_000;

function renderClient() {
  return render(
    <ScriptVersionsClient
      initialVersionData={page1}
      versionStat={{ release_num: 20, pre_release_num: 5 }}
      initialPage={1}
      initialPageSize={10}
    />,
  );
}

/**
 * 翻页时整块组件被一个居中的 `<Spin size="large">` 顶替：
 * 标题、统计条、列表、以及用户刚点下去的分页器全部卸载，
 * 面板从 10 行塌到不到 100px，指针下面的按钮直接消失。
 */
describe('ScriptVersionsClient 的翻页加载态', () => {
  it(
    '翻页期间标题、统计条、分页器保持挂载',
    async () => {
      getVersionListMock.mockReturnValue(new Promise(() => {}));
      renderClient();

      fireEvent.click(screen.getByTitle('2'));

      await waitFor(() =>
        expect(screen.getByTestId('version-list-skeleton')).toBeInTheDocument(),
      );
      expect(screen.getByText(/^version_count:/)).toBeInTheDocument();
      expect(screen.getByText(/^release_chip:/)).toBeInTheDocument();
      expect(screen.getByTitle('2')).toBeInTheDocument();
    },
    SLOW,
  );

  it(
    '骨架按整页条数占位，而不是塌成一个转圈',
    async () => {
      getVersionListMock.mockReturnValue(new Promise(() => {}));
      const { container } = renderClient();

      fireEvent.click(screen.getByTitle('2'));

      await waitFor(() =>
        expect(
          screen.getAllByTestId('version-list-skeleton-item'),
        ).toHaveLength(10),
      );
      expect(container.querySelector('.ant-spin-lg')).toBeNull();
    },
    SLOW,
  );

  it(
    '请求在飞时分页器禁用，避免连点堆叠请求',
    async () => {
      getVersionListMock.mockReturnValue(new Promise(() => {}));
      const { container } = renderClient();

      fireEvent.click(screen.getByTitle('2'));

      await waitFor(() =>
        expect(
          container.querySelector('.ant-pagination-disabled'),
        ).not.toBeNull(),
      );
    },
    SLOW,
  );

  it(
    '请求在飞时再点分页不会叠加第二个请求',
    async () => {
      getVersionListMock.mockReturnValue(new Promise(() => {}));
      renderClient();

      fireEvent.click(screen.getByTitle('2'));
      await waitFor(() =>
        expect(screen.getByTestId('version-list-skeleton')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTitle('3'));

      expect(getVersionListMock).toHaveBeenCalledTimes(1);
    },
    SLOW,
  );
});

/**
 * 私有脚本的安装链接必须带令牌；令牌是异步取的，
 * 按钮却既不 disabled 也不 loading —— 用户完全可能点出一条没有令牌的安装链接。
 */
describe('ScriptVersionsClient 的私有脚本安装按钮', () => {
  function installControls() {
    return screen
      .getAllByText('install_button')
      .map((node) => node.closest('.ant-btn') as HTMLElement);
  }

  it(
    '私有脚本在令牌到达前禁用安装按钮',
    () => {
      scriptMock.public = 3;
      useScriptInstallTokenMock.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderClient();

      const controls = installControls();
      expect(controls.length).toBeGreaterThan(0);
      controls.forEach((control) => {
        expect(control.className).toContain('ant-btn-disabled');
        expect(control.getAttribute('href')).toBeNull();
      });
    },
    SLOW,
  );

  it(
    '令牌到达后安装按钮可用，链接带上令牌',
    () => {
      scriptMock.public = 3;
      useScriptInstallTokenMock.mockReturnValue({
        data: { token: 'tok' },
        isLoading: false,
      });

      renderClient();

      const control = installControls()[0];
      expect(control.className).not.toContain('ant-btn-disabled');
      expect(control.getAttribute('href')).toContain('token=tok');
    },
    SLOW,
  );

  it(
    '公开脚本不受令牌影响',
    () => {
      renderClient();

      const control = installControls()[0];
      expect(control.className).not.toContain('ant-btn-disabled');
      expect(control.getAttribute('href')).toContain('/scripts/code/7/');
    },
    SLOW,
  );
});
