/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import dayjs from 'dayjs';
import { AdminResponsiveList } from './AdminResponsiveList';
import type { AdminCardAction, AdminCardSpec } from './AdminResponsiveList';

vi.mock('next-intl', () => ({
  useTranslations:
    (ns?: string) => (key: string, values?: Record<string, unknown>) =>
      `${ns ? `${ns}.` : ''}${key}${values ? JSON.stringify(values) : ''}`,
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

vi.mock('@/lib/utils/semdate', () => ({
  useSemDateTime: () => (t: number) => `rel${t}`,
}));

// antd 的响应式观察者要 matchMedia，jsdom 没有实现。
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// 浮层（Dropdown / Popconfirm）的对齐要 ResizeObserver，jsdom 同样没有。
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

afterEach(cleanup);

type Row = { id: number; name: string };

const rows: Row[] = [
  { id: 1, name: '脚本一' },
  { id: 2, name: '脚本二' },
];

function renderList(
  card: (row: Row) => AdminCardSpec,
  overrides: Partial<
    React.ComponentProps<typeof AdminResponsiveList<Row>>
  > = {},
) {
  const onPage = vi.fn();
  const onRetry = vi.fn();
  const utils = render(
    <AdminResponsiveList<Row>
      table={<table data-testid="desktop-table" />}
      rows={rows}
      rowKey="id"
      card={card}
      isLoading={false}
      error={undefined}
      onRetry={onRetry}
      pagination={{ current: 1, total: 48, pageSize: 20, onChange: onPage }}
      {...overrides}
    />,
  );
  return { ...utils, onPage, onRetry };
}

function firstCard() {
  return document.querySelector('[data-admin-card]') as HTMLElement;
}

function shownActions(card: HTMLElement) {
  return Array.from(
    card.querySelectorAll<HTMLElement>('[data-admin-card-action]'),
  );
}

function isPrimaryStyled(el: HTMLElement) {
  const btn = (el.closest('button') ?? el) as HTMLElement;
  return (
    btn.classList.contains('ant-btn-primary') ||
    btn.classList.contains('ant-btn-variant-solid')
  );
}

const act = (
  key: string,
  extra: Partial<AdminCardAction> = {},
): AdminCardAction => ({
  key,
  label: key,
  onClick: vi.fn(),
  ...extra,
});

describe('AdminResponsiveList 布局切换', () => {
  it('桌面表格包在 hidden md:block 里，卡片列表包在 md:hidden 里', () => {
    renderList(() => ({ title: 'x' }));
    const table = screen.getByTestId('desktop-table');
    expect(table.parentElement).toHaveClass('hidden', 'md:block');
    expect(firstCard().closest('.md\\:hidden')).not.toBeNull();
  });

  it('每行一张卡片', () => {
    renderList((r) => ({ title: r.name }));
    expect(document.querySelectorAll('[data-admin-card]')).toHaveLength(2);
  });
});

describe('卡片各位置', () => {
  it('渲染图标、标题、标签、副信息、正文与键值字段', () => {
    renderList(() => ({
      icon: <span data-testid="icon" />,
      title: <strong>{'标题'}</strong>,
      badges: <span>{'正常'}</span>,
      subtitle: ['#1', '作者'],
      body: '评价正文',
      fields: [
        { label: '趋势分', value: '12' },
        { label: '开关', value: <button type="button">{'切换'}</button> },
      ],
    }));
    const card = firstCard();
    const c = within(card);
    expect(c.getByTestId('icon')).toBeInTheDocument();
    const title = c.getByText('标题');
    expect(title.closest('[data-admin-card-title]')).toHaveClass(
      'line-clamp-2',
    );
    const badges = c.getByText('正常').closest('[data-admin-card-badges]');
    expect(badges).toHaveClass('max-w-[45%]');
    const subtitle = card.querySelector('[data-admin-card-subtitle]');
    expect(subtitle).toHaveTextContent('#1 · 作者');
    expect(subtitle).toHaveClass('truncate');
    expect(c.getByText('评价正文')).toHaveClass('line-clamp-3');
    expect(c.getByText('趋势分')).toBeInTheDocument();
    expect(c.getByText('12')).toBeInTheDocument();
    // 单元格里的控件原样放进值位
    expect(c.getByRole('button', { name: '切换' })).toBeInTheDocument();
  });

  it('副信息跳过空段，不留悬空的「 · 」（如用户没有邮箱、反馈没有 IP）', () => {
    renderList((r) =>
      r.id === 1
        ? { title: 'x', subtitle: ['#1', '', undefined, '作者'] }
        : { title: 'y', subtitle: ['', null] },
    );
    const [first, second] = Array.from(
      document.querySelectorAll<HTMLElement>('[data-admin-card]'),
    );
    expect(first.querySelector('[data-admin-card-subtitle]')!.textContent).toBe(
      '#1 · 作者',
    );
    // 全部为空时不渲染副信息行
    expect(second.querySelector('[data-admin-card-subtitle]')).toBeNull();
  });

  it('titleLines 可放宽标题行数', () => {
    renderList(() => ({ title: '反馈', titleLines: 3 }));
    expect(
      within(firstCard()).getByText('反馈').closest('[data-admin-card-title]'),
    ).toHaveClass('line-clamp-3');
  });
});

describe('底栏时间', () => {
  it('显示相对时间，点按后显示完整时间', () => {
    const time = 1_700_000_000;
    renderList(() => ({ title: 'x', time }));
    const btn = within(firstCard()).getByRole('button', { name: /rel/ });
    expect(btn).toHaveTextContent(`rel${time}`);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(firstCard()).getByText(
        dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss'),
      ),
    ).toBeInTheDocument();
  });
});

describe('操作规则', () => {
  it('不超过 2 个：全部显示，首个安全操作在最右的主位', () => {
    renderList(() => ({
      title: 'x',
      actions: [act('ban', { danger: true }), act('edit')],
    }));
    const shown = shownActions(firstCard());
    expect(shown.map((el) => el.textContent)).toEqual(['ban', 'edit']);
    expect(shown[1]).toHaveAttribute('data-variant', 'primary');
    expect(shown[0]).toHaveAttribute('data-variant', 'danger');
    expect(
      within(firstCard()).queryByRole('button', {
        name: 'admin.card.more_actions',
      }),
    ).toBeNull();
  });

  it('两个都是安全操作时，按顺序第一个作主位并移到最右', () => {
    renderList(() => ({
      title: 'x',
      actions: [act('level'), act('unban')],
    }));
    const shown = shownActions(firstCard());
    expect(shown.map((el) => el.textContent)).toEqual(['unban', 'level']);
    expect(shown[1]).toHaveAttribute('data-variant', 'primary');
    expect(shown[0]).toHaveAttribute('data-variant', 'default');
  });

  it('超过 2 个：主位放首个安全操作，其余进 ⋯，危险操作在最底部且前有分隔线、红字', async () => {
    renderList(() => ({
      title: 'x',
      actions: [
        act('delete', { danger: true }),
        act('visibility'),
        act('trending'),
        act('ai'),
        act('multiplier'),
      ],
    }));
    const card = firstCard();
    const shown = shownActions(card);
    expect(shown.map((el) => el.textContent)).toEqual(['visibility']);
    expect(shown[0]).toHaveAttribute('data-variant', 'primary');

    const more = within(card).getByRole('button', {
      name: 'admin.card.more_actions',
    });
    fireEvent.click(more);
    const menu = await screen.findByRole('menu');
    const items = Array.from(
      menu.querySelectorAll<HTMLElement>(
        '.ant-dropdown-menu-item, .ant-dropdown-menu-item-divider',
      ),
    );
    expect(
      items.map((el) =>
        el.classList.contains('ant-dropdown-menu-item-divider')
          ? '---'
          : el.textContent,
      ),
    ).toEqual(['trending', 'ai', 'multiplier', '---', 'delete']);
    const del = items[items.length - 1];
    expect(del).toHaveClass('ant-dropdown-menu-item-danger');
    expect(del.querySelector('[data-admin-card-action]')).toHaveAttribute(
      'data-variant',
      'danger',
    );
  });

  it('危险操作在任何情况下都不用实心主样式', async () => {
    const sets: AdminCardAction[][] = [
      [act('d', { danger: true })],
      [act('d', { danger: true }), act('s')],
      [act('d1', { danger: true }), act('d2', { danger: true })],
      [act('d', { danger: true }), act('s1'), act('s2'), act('s3')],
    ];
    for (const actions of sets) {
      renderList(() => ({ title: 'x', actions }));
      for (const el of document.querySelectorAll<HTMLElement>(
        '[data-variant="danger"]',
      )) {
        expect(isPrimaryStyled(el)).toBe(false);
      }
      for (const el of document.querySelectorAll<HTMLElement>(
        '[data-variant="primary"]',
      )) {
        expect(isPrimaryStyled(el)).toBe(false);
        expect(el.closest('button')).not.toHaveClass('ant-btn-dangerous');
      }
      cleanup();
    }
  });

  it('一行只有危险操作时，直接显示为红色描边按钮', () => {
    renderList(() => ({
      title: 'x',
      actions: [
        act('remove', { danger: true }),
        act('purge', { danger: true }),
        act('ban', { danger: true }),
      ],
    }));
    const card = firstCard();
    const shown = shownActions(card);
    expect(shown.map((el) => el.textContent)).toEqual([
      'remove',
      'purge',
      'ban',
    ]);
    for (const el of shown) {
      const btn = el.closest('button') as HTMLElement;
      expect(el).toHaveAttribute('data-variant', 'danger');
      expect(btn).toHaveClass('ant-btn-dangerous', 'ant-btn-variant-outlined');
    }
    expect(
      within(card).queryByRole('button', { name: 'admin.card.more_actions' }),
    ).toBeNull();
  });

  it('⋯ 菜单里需要确认的项走确认对话框，标题与表格相同，确认后才执行', async () => {
    const ai = act('ai', { confirm: { title: '确定要 AI 审核吗？' } });
    const trending = act('trending');
    renderList(() => ({
      title: 'x',
      actions: [act('visibility'), trending, ai],
    }));
    fireEvent.click(
      within(firstCard()).getByRole('button', {
        name: 'admin.card.more_actions',
      }),
    );
    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByText('ai'));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('确定要 AI 审核吗？');
    expect(ai.onClick).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog)
        .getAllByRole('button')
        .find((b) => b.classList.contains('ant-btn-primary')) as HTMLElement,
    );
    await waitFor(() => expect(ai.onClick).toHaveBeenCalledTimes(1));
  });

  it('⋯ 菜单里无需确认的项直接执行', async () => {
    const trending = act('trending');
    renderList(() => ({
      title: 'x',
      actions: [act('visibility'), trending, act('ai')],
    }));
    fireEvent.click(
      within(firstCard()).getByRole('button', {
        name: 'admin.card.more_actions',
      }),
    );
    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByText('trending'));
    expect(trending.onClick).toHaveBeenCalledTimes(1);
  });

  it('直接显示的按钮沿用表格的气泡确认', async () => {
    const restore = act('restore', { confirm: { title: '确定恢复？' } });
    renderList(() => ({ title: 'x', actions: [restore] }));
    fireEvent.click(shownActions(firstCard())[0]);
    const pop = await screen.findByText('确定恢复？');
    expect(pop.closest('.ant-popover')).not.toBeNull();
    expect(restore.onClick).not.toHaveBeenCalled();
    const ok = (pop.closest('.ant-popover') as HTMLElement).querySelector(
      '.ant-btn-primary',
    ) as HTMLElement;
    fireEvent.click(ok);
    await waitFor(() => expect(restore.onClick).toHaveBeenCalledTimes(1));
  });

  it('带 href 的操作渲染为链接', () => {
    renderList(() => ({
      title: 'x',
      actions: [act('view', { onClick: undefined, href: '/r/1' })],
    }));
    const link = firstCard().querySelector('a[href="/r/1"]');
    expect(link).not.toBeNull();
    expect(link).toHaveTextContent('view');
  });
});

describe('列表状态', () => {
  it('加载中显示卡片形状的骨架，不画卡片', () => {
    const { container } = renderList(() => ({ title: 'x' }), {
      isLoading: true,
      rows: [],
    });
    expect(container.querySelectorAll('[data-admin-card]')).toHaveLength(0);
    const busy = container.querySelector('[aria-busy="true"]');
    expect(busy).not.toBeNull();
    expect(busy!.querySelectorAll('.ant-skeleton').length).toBeGreaterThan(1);
  });

  it('空列表沿用 antd 的空态', () => {
    const { container } = renderList(() => ({ title: 'x' }), { rows: [] });
    expect(container.querySelector('.md\\:hidden .ant-empty')).not.toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('失败时显示错误提示与重试', () => {
    const { container, onRetry } = renderList(() => ({ title: 'x' }), {
      rows: [],
      error: new Error('boom'),
    });
    const alert = container.querySelector('.md\\:hidden [role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert).toHaveTextContent('components.loading.failed');
    fireEvent.click(
      within(alert as HTMLElement).getByRole('button', {
        name: 'components.loading.retry',
      }),
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('分页', () => {
  it('只显示页码，不显示总数与每页条数，翻页调用同一个 setter', () => {
    const { container, onPage } = renderList(() => ({ title: 'x' }));
    const pager = container.querySelector(
      '.md\\:hidden .ant-pagination',
    ) as HTMLElement;
    expect(pager).not.toBeNull();
    expect(pager.querySelectorAll('.ant-pagination-item')).toHaveLength(3);
    expect(pager.querySelector('.ant-pagination-total-text')).toBeNull();
    expect(pager.querySelector('.ant-pagination-options')).toBeNull();
    fireEvent.click(within(pager).getByText('2'));
    expect(onPage).toHaveBeenCalledWith(2);
  });

  it('窄屏工具栏渲染在卡片列表上方', () => {
    const { container } = renderList(() => ({ title: 'x' }), {
      mobileToolbar: <div data-testid="tb">{'tb'}</div>,
    });
    const tb = screen.getByTestId('tb');
    expect(tb.closest('.md\\:hidden')).not.toBeNull();
    const card = container.querySelector('[data-admin-card]') as HTMLElement;
    expect(
      tb.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
