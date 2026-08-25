import { describe, expect, it, vi } from 'vitest';
import { openIssueDetail } from './issueNavigation';

describe('openIssueDetail', () => {
  it('opens the issue detail page in a new tab when an issue row is activated', () => {
    const openWindow = vi.fn();

    openIssueDetail(42, 74, openWindow);

    expect(openWindow).toHaveBeenCalledWith(
      '/script-show-page/42/issue/74',
      '_blank',
    );
  });
});
