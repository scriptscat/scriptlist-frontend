/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScoreListItem } from '@/lib/api/services/scripts/scripts';
import type { ListData } from '@/types/api';
import ScriptRatingClient from './ScriptRatingClient';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ user: null }),
}));

const useScoreListMock = vi.fn();
const useMyScoreMock = vi.fn();

vi.mock('@/lib/api/hooks/script', () => ({
  useScoreList: (...args: unknown[]) => useScoreListMock(...args),
  useMyScore: (...args: unknown[]) => useMyScoreMock(...args),
}));

vi.mock('@/lib/api/services/scripts/scripts', () => ({
  scriptService: {
    getScoreState: vi.fn(),
    submitScore: vi.fn(),
    deleteScore: vi.fn(),
    submitCommentReply: vi.fn(),
  },
}));

// 子组件只做展示；这里替换成能把 props 暴露出来的探针。
let lastListProps: {
  ratings: ScoreListItem[];
  loading: boolean;
  onLoadMore?: () => void;
} | null = null;

vi.mock('./rating', () => ({
  RatingOverview: () => <div data-testid="overview" />,
  UserRatingForm: () => <div data-testid="user-form" />,
  RatingList: (props: {
    ratings: ScoreListItem[];
    loading: boolean;
    onLoadMore?: () => void;
  }) => {
    lastListProps = props;
    return <div data-testid="rating-count">{props.ratings.length}</div>;
  },
}));

function makeRating(id: number): ScoreListItem {
  return {
    id,
    user_id: id,
    username: `user-${id}`,
    avatar: '',
    message: `msg-${id}`,
    author_message: '',
    createtime: 0,
    updatetime: 0,
    script_id: 1,
    score: 50,
    author_message_createtime: 0,
  } as ScoreListItem;
}

const initialData: ListData<ScoreListItem> = {
  list: [makeRating(1), makeRating(2)],
  total: 30,
};

const ratingStats = {
  averageRating: 4.5,
  totalRatings: 30,
  distribution: { 5: 30, 4: 0, 3: 0, 2: 0, 1: 0 },
};

beforeEach(() => {
  lastListProps = null;
  useScoreListMock.mockReset();
  useMyScoreMock.mockReset();
  useMyScoreMock.mockReturnValue({ data: undefined, mutate: vi.fn() });
  useScoreListMock.mockReturnValue({
    data: initialData,
    error: undefined,
    mutate: vi.fn(),
    isLoading: false,
    isValidating: false,
  });
});

afterEach(cleanup);

/**
 * SSR 已经把第一页评价取好并传进来了，组件却把列表 state 初始化成 `[]`，
 * 于是「暂无评价」被烤进了服务端 HTML，每次进评价 tab 都会闪一下。
 */
describe('ScriptRatingClient 的初始数据', () => {
  it('服务端渲染出来的 HTML 里就带着第一页评价', () => {
    const html = renderToStaticMarkup(
      <ScriptRatingClient
        initialData={initialData}
        initialRatingStats={ratingStats}
        scriptId={1}
      />,
    );

    expect(html).toContain('>2<');
  });

  it('首次挂载时列表直接来自 initialData', () => {
    render(
      <ScriptRatingClient
        initialData={initialData}
        initialRatingStats={ratingStats}
        scriptId={1}
      />,
    );

    expect(screen.getByTestId('rating-count')).toHaveTextContent('2');
    expect(lastListProps?.ratings).toHaveLength(2);
  });

  it('没有 initialData 时才是空列表', () => {
    useScoreListMock.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: vi.fn(),
      isLoading: true,
      isValidating: true,
    });

    render(
      <ScriptRatingClient
        initialData={null}
        initialRatingStats={ratingStats}
        scriptId={1}
      />,
    );

    expect(lastListProps?.ratings).toHaveLength(0);
  });
});

/**
 * 原实现的 loading 是一个与请求解耦的 100ms 定时器，
 * 滚动监听会在上一页落地前反复推进页码，造成跳页 / 重复页。
 */
describe('ScriptRatingClient 的分页', () => {
  it('loading 跟随请求本身，而不是定时器', () => {
    useScoreListMock.mockReturnValue({
      data: initialData,
      error: undefined,
      mutate: vi.fn(),
      isLoading: false,
      isValidating: true,
    });

    render(
      <ScriptRatingClient
        initialData={initialData}
        initialRatingStats={ratingStats}
        scriptId={1}
      />,
    );

    expect(lastListProps?.loading).toBe(true);
  });

  it('同一页只请求一次，连点 / 连续滚动不会跳页', () => {
    render(
      <ScriptRatingClient
        initialData={initialData}
        initialRatingStats={ratingStats}
        scriptId={1}
      />,
    );

    act(() => {
      lastListProps?.onLoadMore?.();
      lastListProps?.onLoadMore?.();
      lastListProps?.onLoadMore?.();
    });

    const requestedPages = useScoreListMock.mock.calls.map(
      (call) => (call[1] as { page: number }).page,
    );
    expect(Math.max(...requestedPages)).toBe(2);
  });

  it('还有更多数据时才继续翻页', () => {
    useScoreListMock.mockReturnValue({
      data: { list: [makeRating(1), makeRating(2)], total: 2 },
      error: undefined,
      mutate: vi.fn(),
      isLoading: false,
      isValidating: false,
    });

    render(
      <ScriptRatingClient
        initialData={{ list: [makeRating(1), makeRating(2)], total: 2 }}
        initialRatingStats={ratingStats}
        scriptId={1}
      />,
    );

    act(() => {
      lastListProps?.onLoadMore?.();
    });

    const requestedPages = useScoreListMock.mock.calls.map(
      (call) => (call[1] as { page: number }).page,
    );
    expect(Math.max(...requestedPages)).toBe(1);
  });
});
