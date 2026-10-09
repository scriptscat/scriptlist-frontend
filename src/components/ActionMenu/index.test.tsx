/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import zhCN from '../../../public/locales/zh-CN/translations.json';
import ActionMenu from './index';

vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ user: { user_id: 2, is_admin: 1 } }),
}));

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

afterEach(cleanup);

function open(hideReport?: boolean) {
  render(
    <NextIntlClientProvider locale="zh-CN" messages={zhCN}>
      <ActionMenu
        uid={1}
        deleteLevel="admin"
        allowSelfDelete={false}
        onDeleteClick={() => {}}
        hideReport={hideReport}
      >
        <button>{'more'}</button>
      </ActionMenu>
    </NextIntlClientProvider>,
  );
  fireEvent.mouseEnter(screen.getByText('more'));
}

describe('ActionMenu 举报项', () => {
  it('默认对非作者显示「举报」', async () => {
    open();
    expect(await screen.findByText('举报')).toBeTruthy();
  });

  it('hideReport 时不显示「举报」，其它项仍在', async () => {
    open(true);
    expect(await screen.findByText('删除')).toBeTruthy();
    expect(screen.queryByText('举报')).toBeNull();
  });
});
