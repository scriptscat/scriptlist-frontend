/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import ProcessedScriptsList from './ProcessedScriptsList';

const listUserProcessedScripts = vi.fn();

// antd 的 Table 会订阅断点并监听尺寸，jsdom 没有实现 matchMedia / ResizeObserver。
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

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    return t;
  },
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/lib/utils/semdate', () => ({
  useSemDateTime: () => (ts: number) => String(ts),
}));

vi.mock('@/lib/api/services/admin', () => ({
  adminService: {
    listUserProcessedScripts: (...args: unknown[]) =>
      listUserProcessedScripts(...args),
  },
}));

afterEach(() => {
  cleanup();
  listUserProcessedScripts.mockReset();
});

function renderList() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ProcessedScriptsList userId={42} />
    </SWRConfig>,
  );
}

describe('ProcessedScriptsList', () => {
  /**
   * 后端对「该用户名下没有任何脚本」走提前返回，`list` 序列化成 null。
   * 旧实现直接读 `data.list.length`，渲染抛错后被 (main)/error.tsx 接住，
   * 整个页面变成「服务器内部错误」。
   */
  it('list 为 null 时显示空状态而不是抛错', async () => {
    listUserProcessedScripts.mockResolvedValue({ list: null, total: 0 });

    renderList();

    expect(await screen.findByText('processed_empty')).toBeInTheDocument();
  });

  it('有记录时渲染脚本名', async () => {
    listUserProcessedScripts.mockResolvedValue({
      list: [
        {
          id: 1,
          action: 'script_delete',
          operator_id: 1,
          operator_name: 'admin',
          script_id: 100,
          script_name: 'script-A',
          script_status: 2,
          reason: 'abuse',
          createtime: 123,
        },
      ],
      total: 1,
    });

    renderList();

    expect(await screen.findByText('script-A')).toBeInTheDocument();
  });
});
