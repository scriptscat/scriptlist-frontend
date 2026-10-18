/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BanUserModal from './BanUserModal';

const updateUserStatus = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/lib/api/services/admin', () => ({
  adminService: {
    updateUserStatus: (...a: unknown[]) => updateUserStatus(...a),
  },
}));
vi.mock('./ProcessedScriptsList', () => ({ default: () => null }));
vi.mock('antd', async (orig) => ({
  ...(await orig<Record<string, unknown>>()),
  message: { success: vi.fn(), error: vi.fn() },
}));

const renderModal = (onSuccess = vi.fn()) =>
  render(
    <BanUserModal
      visible
      userId={7}
      username="spammer"
      onCancel={vi.fn()}
      onSuccess={onSuccess}
    />,
  );

describe('BanUserModal', () => {
  beforeEach(() => {
    // jsdom 没有 ResizeObserver / matchMedia，antd 浮层与表单需要
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
    vi.clearAllMocks();
    updateUserStatus.mockResolvedValue(undefined);
  });
  afterEach(cleanup);

  it('勾选「清理用户反馈及回复」后，封禁请求带 clean_issues: true', async () => {
    const onSuccess = vi.fn();
    renderModal(onSuccess);

    fireEvent.click(screen.getByLabelText('ban_clean_issues'));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(updateUserStatus).toHaveBeenCalledWith(
      7,
      2,
      expect.objectContaining({ clean_issues: true }),
    );
  });

  it('默认不勾选：清理项全部为 false，不会误删内容', async () => {
    const onSuccess = vi.fn();
    renderModal(onSuccess);

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(updateUserStatus).toHaveBeenCalledWith(7, 2, {
      reason: '',
      expire_at: 0,
      clean_scores: false,
      clean_scripts: false,
      clean_issues: false,
    });
  });
});
