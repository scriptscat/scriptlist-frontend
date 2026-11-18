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
import MobileNavDrawer from './MobileNavDrawer';

const setThemeMode = vi.fn();
let themeMode = { mode: 'light', theme: 'light' };

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh-CN',
}));

vi.mock('@/i18n/routing', () => ({
  languageMap: {
    en: { label: 'English', locale: 'en-US' },
    'zh-CN': { label: '简体中文', locale: 'zh-CN' },
  },
  usePathname: () => '/search',
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

vi.mock('@/contexts/ThemeClientContext', () => ({
  useTheme: () => ({ themeMode, setThemeMode }),
}));

const items = [
  { href: '/', label: 'home', icon: null },
  { href: '/search', label: 'script_list', icon: null },
  { href: 'https://bbs.example.com', label: 'community', icon: null },
  { href: 'https://docs.example.com/', label: 'browser_extension', icon: null },
];

function setup(
  props: Partial<React.ComponentProps<typeof MobileNavDrawer>> = {},
) {
  const onPublish = vi.fn();
  const onSwitchLocale = vi.fn();
  render(
    <MobileNavDrawer
      navItems={items}
      showPublish={false}
      onPublish={onPublish}
      onSwitchLocale={onSwitchLocale}
      {...props}
    />,
  );
  return { onPublish, onSwitchLocale };
}

const trigger = () => screen.getByRole('button', { name: 'open_menu' });
const dialog = () => screen.getByRole('dialog');

async function open() {
  fireEvent.click(trigger());
  await screen.findByRole('dialog');
}

beforeEach(() => {
  themeMode = { mode: 'light', theme: 'light' };
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

describe('MobileNavDrawer', () => {
  it('trigger is hidden from md up and reflects aria-expanded', async () => {
    setup();
    expect(trigger()).toHaveClass('md:!hidden');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    await open();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('lists nav items, highlights the current page and marks external links', async () => {
    setup();
    await open();
    const d = within(dialog());
    expect(d.getByRole('link', { name: /home/ })).toHaveAttribute('href', '/');
    expect(d.getByRole('link', { name: /script_list/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(d.getByRole('link', { name: /home/ })).not.toHaveAttribute(
      'aria-current',
    );
    const community = d.getByRole('link', { name: /community/ });
    expect(community).toHaveAttribute('target', '_blank');
    expect(community).not.toHaveAttribute('aria-current');
    expect(d.getByRole('link', { name: /browser_extension/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('shows the publish button only when logged in', async () => {
    const { onPublish } = setup({ showPublish: true });
    await open();
    fireEvent.click(
      within(dialog()).getByRole('button', { name: /publish_script/ }),
    );
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it('hides the publish button for guests', async () => {
    setup();
    await open();
    expect(
      within(dialog()).queryByRole('button', { name: /publish_script/ }),
    ).toBeNull();
  });

  it('switches theme: explicit modes and auto resolved from the system', async () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: true,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    setup();
    await open();
    const d = within(dialog());
    fireEvent.click(d.getByText('dark'));
    expect(setThemeMode).toHaveBeenLastCalledWith({
      mode: 'dark',
      theme: 'dark',
    });
    themeMode = { mode: 'dark', theme: 'dark' };
    fireEvent.click(d.getByText('system'));
    expect(setThemeMode).toHaveBeenLastCalledWith({
      mode: 'auto',
      theme: 'dark',
    });
  });

  it('switches locale through the callback', async () => {
    const { onSwitchLocale } = setup();
    await open();
    fireEvent.click(within(dialog()).getByRole('button', { name: /English/ }));
    expect(onSwitchLocale).toHaveBeenCalledWith('en');
  });

  it('closes on Esc and returns focus to the trigger', async () => {
    setup();
    await open();
    fireEvent.keyDown(dialog(), { key: 'Escape', keyCode: 27 });
    await waitFor(() =>
      expect(trigger()).toHaveAttribute('aria-expanded', 'false'),
    );
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it('closes when a nav link is clicked', async () => {
    setup();
    await open();
    fireEvent.click(within(dialog()).getByRole('link', { name: /home/ }));
    await waitFor(() =>
      expect(trigger()).toHaveAttribute('aria-expanded', 'false'),
    );
  });
});
