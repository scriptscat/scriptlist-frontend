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
import type * as SemDate from '@/lib/utils/semdate';
import type { ScriptInfoMeta } from '../types';
import ScriptDetailMobileHeader from './ScriptDetailMobileHeader';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/utils/semdate', async (importOriginal) => ({
  ...(await importOriginal<typeof SemDate>()),
  useSemDateTime: () => (t: number) => `t${t}`,
}));

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  // antd Avatar 通过 useBreakpoint 订阅 matchMedia，jsdom 没有实现。
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const script = {
  id: 7,
  user_id: 42,
  username: 'enncy',
  avatar: '',
  name: 'OCS 网课助手',
  description: 'desc',
  category: { id: 1, name: '工具' },
  tags: [{ id: 2, name: '学习自动化' }],
  score: 47,
  score_num: 1,
  type: 1,
  public: 1,
  today_install: 9500,
  total_install: 8_866_925,
  createtime: 100,
  updatetime: 200,
  script: { version: '5.4.2', meta_json: {} },
} as unknown as ScriptInfoMeta;

function renderHeader(s: ScriptInfoMeta = script) {
  return render(
    <ScriptDetailMobileHeader
      script={s}
      name="OCS 网课助手"
      description="很长的简介"
    />,
  );
}

// jsdom 没有布局：用 scrollHeight / clientHeight 模拟简介被 3 行截断。
function stubDescriptionOverflow(overflowing: boolean) {
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(
    overflowing ? 200 : 60,
  );
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(60);
}

describe('ScriptDetailMobileHeader (scheme B)', () => {
  beforeEach(() => stubDescriptionOverflow(false));

  it('shows rating, version, author and 24h installs at the top', () => {
    renderHeader();
    expect(screen.getByRole('heading', { name: 'OCS 网课助手' })).toBeTruthy();
    expect(screen.getByTestId('mobile-header-rating').textContent).toContain(
      '4.7',
    );
    expect(screen.getByText('v5.4.2')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /enncy/ }).getAttribute('href'),
    ).toBe('/users/42');
    const today = screen.getByTestId('mobile-header-today');
    expect(today.textContent).toContain('stats.today_installs');
    expect(today.textContent).toContain('+9.5K');
  });

  it('shows total installs, updated and created time in the footer', () => {
    renderHeader();
    const footer = screen.getByTestId('mobile-header-footer');
    expect(footer.textContent).toContain('8.9M');
    expect(footer.textContent).toContain('stats.total_installs');
    expect(footer.textContent).toContain('info.updated_at:{"time":"t200"}');
    expect(footer.textContent).toContain('info.created_at:{"time":"t100"}');
  });

  it('shows the description, category and tags', () => {
    renderHeader();
    expect(screen.getByText('很长的简介')).toBeTruthy();
    expect(screen.getByText('工具')).toBeTruthy();
    expect(screen.getByText('#学习自动化')).toBeTruthy();
  });

  it('shows "-" when the script has no rating', () => {
    renderHeader({ ...script, score: 0, score_num: 0 });
    expect(screen.getByTestId('mobile-header-rating').textContent).toContain(
      '-',
    );
  });

  it('has no expand toggle when the description fits in 3 lines', () => {
    renderHeader();
    expect(screen.queryByRole('button', { name: 'info.expand' })).toBeNull();
    expect(screen.getByText('很长的简介').className).toContain('line-clamp-3');
  });

  it('expands and collapses a description longer than 3 lines', () => {
    stubDescriptionOverflow(true);
    renderHeader();
    const desc = screen.getByText('很长的简介');
    expect(desc.className).toContain('line-clamp-3');

    const expand = screen.getByRole('button', { name: 'info.expand' });
    expect(expand.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(expand);

    expect(desc.className).not.toContain('line-clamp-3');
    const collapse = screen.getByRole('button', { name: 'info.collapse' });
    expect(collapse.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(collapse);

    expect(desc.className).toContain('line-clamp-3');
    expect(screen.getByRole('button', { name: 'info.expand' })).toBeTruthy();
  });
});
