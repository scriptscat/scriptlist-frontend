/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import ScriptCard from './ScriptCard';
import type { ScriptListItem } from '@/app/[locale]/(main)/script-show-page/[id]/types';

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

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh-CN',
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/utils/semdate', () => ({
  formatNumber: (n: number) => String(n),
  useSemDateTime: () => () => 'just now',
}));

vi.mock('@/components/ActionMenu', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ScriptIcon', () => ({ default: () => <i /> }));

vi.mock('@/lib/api/services/scripts', () => ({
  scriptService: { deleteScript: vi.fn() },
}));

function makeScript(tagCount: number): ScriptListItem {
  return {
    id: 1,
    user_id: 1,
    username: 'alice',
    avatar: '',
    name: 'Demo',
    description: 'desc',
    category: undefined,
    tags: Array.from({ length: tagCount }, (_, i) => ({
      id: i + 1,
      name: 'tag' + i,
    })),
    type: 1,
    public: 1,
    score: 5,
    score_num: 1,
    today_install: 3,
    total_install: 120,
    updatetime: 1,
    script: { version: '1.0.0', meta_json: {} },
  } as unknown as ScriptListItem;
}

afterEach(cleanup);

describe('ScriptCard narrow-screen layout', () => {
  it('places a mobile-only tags row after the description, max 3 + N', () => {
    render(<ScriptCard script={makeScript(5)} />);
    const description = screen.getByTestId('script-card-description');
    const mobileTags = screen.getByTestId('script-card-tags-mobile');
    expect(mobileTags.className).toContain('md:hidden');
    expect(
      description.compareDocumentPosition(mobileTags) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(mobileTags).getAllByText(/^#tag/)).toHaveLength(3);
    expect(within(mobileTags).getByText('+2')).toBeTruthy();
  });

  it('keeps the desktop footer tags, hidden below md', () => {
    render(<ScriptCard script={makeScript(5)} />);
    const footerTags = screen.getByTestId('script-card-tags-desktop');
    expect(footerTags.className).toContain('hidden');
    expect(footerTags.className).toContain('md:flex');
    expect(footerTags.className).toContain('md:max-w-[40%]');
  });

  it('footer stats row never wraps and pushes share to the right', () => {
    render(<ScriptCard script={makeScript(0)} />);
    const stats = screen.getByTestId('script-card-stats');
    expect(stats.className).toContain('flex-nowrap');
    expect(stats.className).toContain('whitespace-nowrap');
  });

  it('renders no empty mobile tags row without tags', () => {
    render(<ScriptCard script={makeScript(0)} />);
    expect(screen.queryByTestId('script-card-tags-mobile')).toBeNull();
  });
});
