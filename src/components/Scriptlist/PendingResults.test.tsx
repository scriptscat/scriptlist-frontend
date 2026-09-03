/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import PendingResults from './PendingResults';

afterEach(cleanup);

/**
 * 翻页 / 换筛选走的是 `router.push`（编程式导航），全局的 `nextjs-toploader`
 * 只在 `<a>` 点击时启动，所以这段等待期间屏幕上不会有任何反馈。
 *
 * 这里的契约是：旧结果留在原地（不闪空、不塌高度）、变暗且不可点，
 * 顶部一条细进度条说明「在取新的一页」。
 */
describe('PendingResults', () => {
  it('空闲时不渲染进度条，内容可正常交互', () => {
    render(
      <PendingResults pending={false} label="加载中">
        <button type="button">{'第一页'}</button>
      </PendingResults>,
    );

    expect(screen.queryByTestId('pending-results-bar')).toBeNull();
    expect(screen.getByTestId('pending-results')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(screen.getByTestId('pending-results-content').className).not.toMatch(
      /pointer-events-none/,
    );
  });

  it('等待中旧内容仍然挂载，只是变暗并屏蔽点击', () => {
    render(
      <PendingResults pending label="加载中">
        <button type="button">{'第一页'}</button>
      </PendingResults>,
    );

    // 关键：旧内容不能被卸载，否则列表会闪成空白并塌掉高度。
    expect(screen.getByText('第一页')).toBeInTheDocument();
    const content = screen.getByTestId('pending-results-content');
    expect(content.className).toMatch(/opacity-60/);
    expect(content.className).toMatch(/pointer-events-none/);
  });

  it('等待中在顶部渲染进度条，并给读屏软件播报状态', () => {
    render(
      <PendingResults pending label="加载中">
        <div>{'内容'}</div>
      </PendingResults>,
    );

    expect(screen.getByTestId('pending-results-bar')).toBeInTheDocument();
    expect(screen.getByTestId('pending-results')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent('加载中');
  });
});
