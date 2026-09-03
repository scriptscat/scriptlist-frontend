/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import UserFavorites from './UserFavorites';
import type { FavoriteFolderItem } from '@/lib/api/services/scripts/favorites';
import type { ScriptListItem } from '@/app/[locale]/(main)/script-show-page/[id]/types';

const push = vi.fn();

// antd 的 Row/Col 会订阅断点，jsdom 没有实现 matchMedia。
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
  useTranslations: () => {
    const t = (key: string) => key;
    return t;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/Scriptlist/ScriptCard', () => ({
  default: ({ script }: { script: ScriptListItem }) => (
    <div data-testid="script-card">{script.name}</div>
  ),
}));

vi.mock('@/lib/api/services/scripts', () => ({
  scriptFavoriteService: { unfavoriteScript: vi.fn() },
}));

afterEach(() => {
  cleanup();
  push.mockReset();
});

const folders: FavoriteFolderItem[] = [];

function makeScripts(count: number): ScriptListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `script-${i + 1}`,
  })) as unknown as ScriptListItem[];
}

function renderList() {
  return render(
    <UserFavorites
      userId={1}
      folders={folders}
      scripts={makeScripts(20)}
      total={100}
      currentPage={1}
    />,
  );
}

/**
 * 翻页走 `router.push`，没有全局顶部进度条；旧实现点了第 2 页之后整块列表
 * 保持可交互、页码还停在 1，用户完全看不出请求已经发出。
 */
describe('UserFavorites 分页', () => {
  it('点击页码会跳转到对应的 page 参数', () => {
    renderList();

    fireEvent.click(screen.getByTitle('2'));

    expect(push).toHaveBeenCalledWith('?page=2');
  });

  it('页码立即前进到点击的那一页，不再等服务端回包', () => {
    renderList();

    fireEvent.click(screen.getByTitle('2'));

    expect(screen.getByTitle('2').closest('li')).toHaveClass(
      'ant-pagination-item-active',
    );
  });

  it('结果列表包在等待外壳里，翻页期间旧内容保持挂载', () => {
    renderList();

    expect(screen.getByTestId('pending-results')).toBeInTheDocument();
    expect(screen.getAllByTestId('script-card')).toHaveLength(20);
  });
});
