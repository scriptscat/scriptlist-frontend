/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminMobileNav from './AdminMobileNav';
import type { AdminNavItem } from './AdminMobileNav';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
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

const items: AdminNavItem[] = [
  { key: 'users', label: '用户管理', href: '/admin/users' },
  { key: 'scripts', label: '脚本管理', href: '/admin/scripts' },
  {
    key: 'ai-review',
    label: 'AI 审核',
    children: [
      { key: 'ai-review-records', label: '审核记录', href: '/admin/ai-review' },
      {
        key: 'ai-review-fullscan',
        label: '全站扫描',
        href: '/admin/ai-review/full-scan',
      },
    ],
  },
];

const setup = (selectedKey: string) =>
  render(<AdminMobileNav items={items} selectedKey={selectedKey} />);
const trigger = () => screen.getByRole('button', { name: /title/ });
async function open() {
  fireEvent.click(trigger());
  return within(await screen.findByRole('dialog'));
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AdminMobileNav', () => {
  it('trigger shows the section title and current page, hidden from md up', () => {
    setup('users');
    expect(trigger()).toHaveTextContent('title');
    expect(trigger()).toHaveTextContent('用户管理');
    expect(trigger()).toHaveClass('md:!hidden');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows 父 · 子 for a submenu page', () => {
    setup('ai-review-records');
    expect(trigger()).toHaveTextContent('AI 审核 · 审核记录');
  });

  it('opens a sheet with every item, highlighting the current one', async () => {
    setup('ai-review-fullscan');
    const d = await open();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(d.getByRole('link', { name: '用户管理' })).toHaveAttribute(
      'href',
      '/admin/users',
    );
    expect(d.getByText('AI 审核')).toBeInTheDocument();
    expect(d.getByRole('link', { name: '审核记录' })).toBeInTheDocument();
    expect(d.getByRole('link', { name: '全站扫描' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(d.getByRole('link', { name: '用户管理' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('selecting an item closes the sheet', async () => {
    setup('users');
    const d = await open();
    fireEvent.click(d.getByRole('link', { name: '脚本管理' }));
    await waitFor(() =>
      expect(trigger()).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('Esc closes the sheet and focus returns to the trigger', async () => {
    setup('users');
    await open();
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      keyCode: 27,
    });
    await waitFor(() =>
      expect(trigger()).toHaveAttribute('aria-expanded', 'false'),
    );
    await waitFor(() => expect(trigger()).toHaveFocus());
  });
});
