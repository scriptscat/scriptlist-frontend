/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APIError } from '@/types/api';
import type { AdminContentReportDetail } from '@/types/api';
import ContentReportActions from './ContentReportActions';

const handle = vi.fn();
const reopen = vi.fn();
const success = vi.fn();
const error = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/lib/api/hooks/admin', () => ({
  useContentReportActions: () => ({ handle, reopen }),
}));
vi.mock('antd', async (orig) => ({
  ...(await orig<Record<string, unknown>>()),
  message: {
    success: (...a: unknown[]) => success(...a),
    error: (...a: unknown[]) => error(...a),
  },
}));

const detail = (status: number) =>
  ({ id: 9, status }) as unknown as AdminContentReportDetail;

describe('ContentReportActions', () => {
  beforeEach(() => {
    // jsdom 没有 ResizeObserver，antd 浮层需要
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.clearAllMocks();
    handle.mockResolvedValue(undefined);
    reopen.mockResolvedValue(undefined);
  });
  afterEach(cleanup);

  it('待处理：驳回带备注调用 handle，成功后提示并 onDone', async () => {
    const onDone = vi.fn();
    render(
      <ContentReportActions detail={detail(1)} note=" 误报 " onDone={onDone} />,
    );
    fireEvent.click(screen.getByText('action_reject'));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(handle).toHaveBeenCalledWith(9, { action: 'reject', note: '误报' });
    expect(success).toHaveBeenCalled();
  });

  it('标记已处理调用 resolve', async () => {
    render(
      <ContentReportActions detail={detail(1)} note="" onDone={vi.fn()} />,
    );
    fireEvent.click(screen.getByText('action_resolve'));
    await waitFor(() =>
      expect(handle).toHaveBeenCalledWith(9, { action: 'resolve' }),
    );
  });

  it('删除需要二次确认：点击按钮本身不请求，确认后才 delete', async () => {
    const onDone = vi.fn();
    render(
      <ContentReportActions detail={detail(1)} note="n" onDone={onDone} />,
    );
    fireEvent.click(screen.getByText('action_delete'));
    expect(handle).not.toHaveBeenCalled();
    const ok = await screen.findAllByText('action_delete');
    fireEvent.click(ok[ok.length - 1]);
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(handle).toHaveBeenCalledWith(9, { action: 'delete', note: 'n' });
  });

  it('失败：提示后端错误，不关闭抽屉（不调 onDone）', async () => {
    handle.mockRejectedValue(new APIError(400, 112010, '该举报已处理'));
    const onDone = vi.fn();
    render(
      <ContentReportActions detail={detail(1)} note="keep" onDone={onDone} />,
    );
    fireEvent.click(screen.getByText('action_reject'));
    await waitFor(() => expect(error).toHaveBeenCalledWith('该举报已处理'));
    expect(onDone).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it('非 APIError 失败回落通用提示', async () => {
    handle.mockRejectedValue(new Error('boom'));
    render(
      <ContentReportActions detail={detail(1)} note="" onDone={vi.fn()} />,
    );
    fireEvent.click(screen.getByText('action_reject'));
    await waitFor(() => expect(error).toHaveBeenCalledWith('action_failed'));
  });

  it('已结案：只有重新打开', async () => {
    const onDone = vi.fn();
    render(<ContentReportActions detail={detail(2)} note="" onDone={onDone} />);
    expect(screen.queryByText('action_reject')).toBeNull();
    expect(screen.queryByText('action_delete')).toBeNull();
    fireEvent.click(screen.getByText('action_reopen'));
    await waitFor(() => expect(reopen).toHaveBeenCalledWith(9));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it('请求进行中其余按钮禁用', async () => {
    let release!: () => void;
    handle.mockReturnValue(new Promise<void>((r) => (release = r)));
    render(
      <ContentReportActions detail={detail(1)} note="" onDone={vi.fn()} />,
    );
    fireEvent.click(screen.getByText('action_reject'));
    await waitFor(() =>
      expect(
        screen.getByText('action_resolve').closest('button'),
      ).toBeDisabled(),
    );
    release();
  });
});
