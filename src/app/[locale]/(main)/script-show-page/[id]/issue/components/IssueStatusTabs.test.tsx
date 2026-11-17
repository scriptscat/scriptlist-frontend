/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import IssueStatusTabs from './IssueStatusTabs';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

afterEach(cleanup);

describe('IssueStatusTabs 列表框表头', () => {
  it('同时显示待解决 / 已解决数量', () => {
    render(
      <IssueStatusTabs
        status="all"
        openCount={23}
        closedCount={108}
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('button', { name: /filter_pending/ }),
    ).toHaveTextContent('23');
    expect(
      screen.getByRole('button', { name: /filter_resolved/ }),
    ).toHaveTextContent('108');
  });

  it('当前筛选项 aria-pressed 为 true，其余为 false', () => {
    render(
      <IssueStatusTabs
        status="resolved"
        openCount={1}
        closedCount={2}
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('button', { name: /filter_resolved/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: /filter_pending/ }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'filter_all' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('点击各项回调对应的状态', () => {
    const onChange = vi.fn();
    render(
      <IssueStatusTabs
        status="all"
        openCount={1}
        closedCount={2}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /filter_pending/ }));
    fireEvent.click(screen.getByRole('button', { name: /filter_resolved/ }));
    fireEvent.click(screen.getByRole('button', { name: 'filter_all' }));
    expect(onChange.mock.calls).toEqual([['pending'], ['resolved'], ['all']]);
  });
});
