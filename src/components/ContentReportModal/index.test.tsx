/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import zhCN from '../../../public/locales/zh-CN/translations.json';
import { APIError } from '@/types/api';
import { scriptReportService } from '@/lib/api/services/scripts/report';
import ContentReportModal from './index';

vi.mock('@/lib/api/services/scripts/report', () => ({
  scriptReportService: { createContentReport: vi.fn() },
}));

const create = vi.mocked(scriptReportService.createContentReport);

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

afterEach(() => {
  cleanup();
  create.mockReset();
});

function setup(
  target: Partial<React.ComponentProps<typeof ContentReportModal>> = {},
) {
  const onClose = vi.fn();
  const onSubmitted = vi.fn();
  render(
    <NextIntlClientProvider locale="zh-CN" messages={zhCN}>
      <ContentReportModal
        open
        onClose={onClose}
        scriptId={7}
        targetType="score"
        targetId={11}
        authorName="alice"
        quote="这是被举报的评价"
        {...target}
      />
    </NextIntlClientProvider>,
  );
  return { onClose, onSubmitted };
}

const submitBtn = () => screen.getByRole('button', { name: /提交举报/ });

describe('ContentReportModal', () => {
  it('标题随对象变化并引用原文', () => {
    setup();
    expect(screen.getByText('举报评价')).toBeTruthy();
    expect(screen.getByText('这是被举报的评价')).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(6);
  });

  it('引用行：反馈带《标题》，回复只写「作者名 的回复」', () => {
    setup({ targetType: 'issue', authorName: 'bob', issueTitle: '无法安装' });
    expect(screen.getByText('bob 的反馈《无法安装》')).toBeTruthy();
    cleanup();
    setup({
      targetType: 'issue_comment',
      issueId: 3,
      authorName: 'carol',
      issueTitle: '无法安装',
    });
    expect(screen.getByText('carol 的回复')).toBeTruthy();
  });

  it('未选原因时提交按钮禁用', () => {
    setup();
    expect((submitBtn() as HTMLButtonElement).disabled).toBe(true);
  });

  it('选「其他」且说明为空：显示错误且不发请求', () => {
    setup();
    fireEvent.click(screen.getByRole('radio', { name: /其他/ }));
    fireEvent.click(submitBtn());
    expect(screen.getByText('选择「其他」时请填写说明')).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });

  it('成功：发送 trim 后的请求体并关闭', async () => {
    create.mockResolvedValue({ id: 1 });
    const { onClose } = setup({
      targetType: 'issue_comment',
      targetId: 5,
      issueId: 3,
    });
    fireEvent.click(screen.getByRole('radio', { name: /垃圾广告/ }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '  刷屏  ' },
    });
    fireEvent.click(submitBtn());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(create).toHaveBeenCalledWith(7, {
      target_type: 'issue_comment',
      target_id: 5,
      issue_id: 3,
      reason: 'spam',
      content: '刷屏',
    });
  });

  it.each([
    [
      '重复举报',
      new APIError(400, 112006, '你已经举报过该内容，管理员会尽快处理'),
    ],
    ['目标不存在', new APIError(404, 112007, '内容不存在')],
    ['其它失败', new Error('network')],
  ])('%s：弹窗保留且输入不丢', async (_n, err) => {
    create.mockRejectedValue(err);
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('radio', { name: /辱骂攻击/ }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '保留我' },
    });
    fireEvent.click(submitBtn());
    await waitFor(() => expect(create).toHaveBeenCalled());
    await waitFor(() =>
      expect((submitBtn() as HTMLButtonElement).disabled).toBe(false),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(
      '保留我',
    );
    expect(
      (screen.getByRole('radio', { name: /辱骂攻击/ }) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });
});
