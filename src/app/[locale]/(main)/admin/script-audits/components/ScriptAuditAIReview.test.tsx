/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AIReviewDetail } from '@/lib/api/services/aiReview';
import ScriptAuditAIReview from './ScriptAuditAIReview';

const useScriptAuditAIReview = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh-CN',
}));
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('@/lib/api/hooks/useAIReviews', () => ({
  useScriptAuditAIReview: (...args: unknown[]) =>
    useScriptAuditAIReview(...args),
}));

const detail = (patch: Partial<AIReviewDetail> = {}): AIReviewDetail =>
  ({
    id: 7,
    script_id: 3,
    script_name: 'demo',
    script_code_id: 11,
    user_id: 1,
    status: 3,
    verdict: 3,
    attempts: 1,
    model: 'gpt-test',
    prompt_tokens: 10,
    completion_tokens: 20,
    latency_ms: 1234,
    reason: '调用了外部接口上传数据',
    summary: { zh: '中文摘要内容', en: 'english summary' },
    tags: ['network', 'privacy'],
    admin_note: '',
    createtime: 1700000000,
    updatetime: 1700000100,
    risk_signals: JSON.stringify([
      { name: 'eval 用法', severity: 'high', evidence_line: 42 },
    ]),
    noisy_lines: '[]',
    last_error: '',
    script_audit_id: 99,
    ...patch,
  }) as AIReviewDetail;

const mockHook = (aiReview: AIReviewDetail | null) => {
  useScriptAuditAIReview.mockReturnValue({
    aiReview,
    isLoading: false,
    error: undefined,
    pollingStopped: false,
    refresh: vi.fn(),
  });
};

describe('ScriptAuditAIReview', () => {
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
    // antd 的响应式观察者要 matchMedia，jsdom 未实现
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it('运行中（status 0）显示 ai_review_card_running', () => {
    mockHook(detail({ status: 0, verdict: 0 }));
    render(<ScriptAuditAIReview auditId={99} onTrigger={vi.fn()} />);
    expect(screen.getByText('ai_review_card_running')).toBeTruthy();
  });

  it('终态 uncertain 渲染理由、中文摘要、标签与风险信号', () => {
    mockHook(detail({ status: 3, verdict: 3 }));
    render(<ScriptAuditAIReview auditId={99} onTrigger={vi.fn()} />);
    expect(screen.getByText('ai_review_card_uncertain')).toBeTruthy();
    expect(screen.getByText('调用了外部接口上传数据')).toBeTruthy();
    expect(screen.getByText('中文摘要内容')).toBeTruthy();
    expect(screen.getByText('network')).toBeTruthy();
    expect(screen.getByText('privacy')).toBeTruthy();
    expect(screen.getByText('eval 用法')).toBeTruthy();
    expect(screen.getByText('@ L42')).toBeTruthy();
  });

  it('pass（status 1）展示提示，且不触发任何通过操作', () => {
    const onTrigger = vi.fn();
    mockHook(detail({ status: 1, verdict: 1 }));
    render(<ScriptAuditAIReview auditId={99} onTrigger={onTrigger} />);
    expect(screen.getByText('ai_review_card_pass_hint')).toBeTruthy();
    // 只有 AI 卡片自己的入口（重试/空态按钮）才会调 onTrigger，pass 时都不应出现
    expect(screen.queryByText('ai_review_card_retry')).toBeNull();
    expect(screen.queryByText('action_ai_review')).toBeNull();
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it('失败（status 4）展示 last_error，点重试调用 onTrigger', () => {
    const onTrigger = vi.fn();
    mockHook(
      detail({ status: 4, verdict: 0, last_error: 'upstream 500 boom' }),
    );
    render(<ScriptAuditAIReview auditId={99} onTrigger={onTrigger} />);
    expect(screen.getByText('upstream 500 boom')).toBeTruthy();
    fireEvent.click(screen.getByText('ai_review_card_retry'));
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('无记录展示空态，点按钮调用 onTrigger', () => {
    const onTrigger = vi.fn();
    mockHook(null);
    render(<ScriptAuditAIReview auditId={99} onTrigger={onTrigger} />);
    expect(screen.getByText('ai_review_card_empty')).toBeTruthy();
    fireEvent.click(screen.getByText('action_ai_review'));
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });
});
