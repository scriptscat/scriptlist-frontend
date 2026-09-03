/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RatingList from './RatingList';
import type { ScoreListItem } from '@/lib/api/services/scripts/scripts';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// 列表条目本身不在本用例的关注范围内，它拖着 UserContext / ScriptContext 一串依赖。
vi.mock('./RatingItem', () => ({
  default: ({ rating }: { rating: ScoreListItem }) => (
    <div data-testid="rating-item">{rating.id}</div>
  ),
}));

afterEach(cleanup);

function makeRating(id: number): ScoreListItem {
  return {
    id,
    user_id: 1,
    username: 'u',
    avatar: '',
    message: 'm',
    author_message: '',
    createtime: 0,
    updatetime: 0,
    script_id: 1,
    score: 50,
    author_message_createtime: 0,
  } as ScoreListItem;
}

const noop = async () => {};

const baseProps = {
  sortBy: 'newest' as const,
  onSortChange: () => {},
  onReply: noop,
  onDeleteRating: noop,
  onDeleteReply: noop,
};

/**
 * 「空」和「正在加载」是两件事。
 * 原实现把 `ratings.length === 0 → <Empty>` 排在 loading 之前，
 * 转圈又只写在非空分支里，于是首屏「空 + 正在加载」必定先闪一次「暂无评价」。
 */
describe('RatingList 的加载 / 空状态', () => {
  it('正在加载且还没有数据时画骨架，不画「暂无评价」', () => {
    render(<RatingList {...baseProps} ratings={[]} loading />);

    expect(screen.queryByText('empty_title')).toBeNull();
    expect(screen.getByTestId('rating-list-skeleton')).toBeInTheDocument();
  });

  it('骨架条数与真实评价行一致，且撑住最小高度避免塌陷', () => {
    const { container } = render(
      <RatingList {...baseProps} ratings={[]} loading />,
    );

    expect(screen.getAllByTestId('rating-list-skeleton-item')).toHaveLength(3);
    expect(container.querySelector('.min-h-\\[420px\\]')).not.toBeNull();
  });

  it('加载中不显示条数，避免先闪一个 0', () => {
    render(<RatingList {...baseProps} ratings={[]} loading />);

    expect(screen.queryByTestId('rating-count')).toBeNull();
  });

  it('加载结束确实没有数据时才显示「暂无评价」', () => {
    render(<RatingList {...baseProps} ratings={[]} loading={false} />);

    expect(screen.getByText('empty_title')).toBeInTheDocument();
    expect(screen.queryByTestId('rating-list-skeleton')).toBeNull();
  });

  it('已有数据时刷新不换成骨架，旧列表继续可见', () => {
    render(
      <RatingList
        {...baseProps}
        ratings={[makeRating(1), makeRating(2)]}
        loading
      />,
    );

    expect(screen.getAllByTestId('rating-item')).toHaveLength(2);
    expect(screen.queryByTestId('rating-list-skeleton')).toBeNull();
    expect(screen.getByTestId('rating-count')).toHaveTextContent('2');
  });
});
