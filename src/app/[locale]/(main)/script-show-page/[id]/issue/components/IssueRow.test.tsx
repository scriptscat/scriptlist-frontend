/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Issue } from '@/lib/api/services/scripts/issue';
import IssueRow from './IssueRow';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
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

vi.mock('@/lib/utils/semdate', () => ({
  useSemDateTime: () => (t: number) => `t${t}`,
}));

afterEach(cleanup);

const base: Issue = {
  id: 131,
  user_id: 7,
  avatar: '',
  title: '倍速按钮不显示',
  content: '',
  username: '小明',
  labels: ['bug', 'feature'],
  status: 1,
  createtime: 100,
  updatetime: 200,
  comment_count: 3,
};

function renderRow(issue: Partial<Issue> = {}) {
  return render(<IssueRow scriptId={10} issue={{ ...base, ...issue }} />);
}

describe('IssueRow GitHub 式行布局', () => {
  it('状态图标排在最前，读屏能读出状态', () => {
    const { container } = renderRow({ status: 1 });
    const icon = screen.getByRole('img', { name: 'status_pending' });
    expect(
      container.querySelector('[role="link"]')?.firstElementChild,
    ).toContainElement(icon);
  });

  it('已解决的反馈显示已解决状态', () => {
    renderRow({ status: 3 });
    expect(
      screen.getByRole('img', { name: 'status_resolved' }),
    ).toBeInTheDocument();
  });

  it('标签与标题在同一行，跟在标题后面', () => {
    renderRow();
    const title = screen.getByText('倍速按钮不显示', { selector: 'a' });
    const line = title.parentElement!;
    expect(within(line).getByText('bug')).toBeInTheDocument();
    expect(
      title.compareDocumentPosition(within(line).getByText('bug')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('超过 4 个标签折叠为 +N', () => {
    renderRow({ labels: ['bug', 'feature', 'question', 'a', 'b', 'c'] });
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('b')).not.toBeInTheDocument();
  });

  it('第二行显示 #id、作者、创建与更新时间', () => {
    renderRow();
    const meta = screen.getByText(/#131/);
    expect(meta).toHaveTextContent('小明');
    expect(meta).toHaveTextContent('created_at:{"time":"t100"}');
    expect(meta).toHaveTextContent('updated_at:{"time":"t200"}');
  });

  it('未更新过时不显示更新时间', () => {
    renderRow({ updatetime: 100 });
    expect(screen.getByText(/#131/)).not.toHaveTextContent('updated_at');
  });

  it('有回复时右侧显示回复数，0 条时不显示', () => {
    renderRow({ comment_count: 3 });
    expect(
      screen.getByRole('link', { name: 'comment_count:{"count":3}' }),
    ).toHaveTextContent('3');
    cleanup();
    renderRow({ comment_count: 0 });
    expect(
      screen.queryByRole('link', { name: /comment_count/ }),
    ).not.toBeInTheDocument();
  });
});
