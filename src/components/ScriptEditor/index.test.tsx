/** @vitest-environment jsdom */
import type { ReactNode } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import ScriptEditor from './index';
import type { ScriptInfo } from '@/app/[locale]/(main)/script-show-page/[id]/types';

/**
 * `next/dynamic` 在测试里永远停在「还没加载完」那一帧，
 * 这样两个编辑器的占位就是被渲染出来的那一份，可以直接断言形状。
 */
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (
    _loader: unknown,
    options?: { loading?: () => ReactNode },
  ): (() => ReactNode) => {
    const Dynamic = () => <>{options?.loading?.()}</>;
    return Dynamic;
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

vi.mock('@/lib/api/hooks', () => ({
  useCategoryList: () => ({ data: { categories: [] }, isLoading: false }),
}));

beforeAll(() => {
  // antd 的 Select / TextArea 内部依赖 ResizeObserver，jsdom 没有实现。
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

afterEach(cleanup);

const script = {
  id: 1,
  content: 'desc',
  tags: [],
  script: { code: '', version: '1.0.0' },
  type: 1,
} as unknown as ScriptInfo;

describe('ScriptEditor 编辑器占位', () => {
  it('代码编辑器占位画出工具条与 12 行代码，并带已翻译的文案', () => {
    render(<ScriptEditor script={script} />);

    const box = screen.getByTestId('script-editor-code-loading');
    expect(box).toBeInTheDocument();
    // 高度必须与真实编辑器一致，否则加载完成会把下面的内容顶走。
    expect(box).toHaveStyle({ height: '500px' });
    expect(
      screen
        .getByTestId('script-editor-code-loading-lines')
        .querySelectorAll('.ant-skeleton-input'),
    ).toHaveLength(12);
    expect(box.textContent).toContain('components.loading.code');
  });

  it('说明编辑器占位保留 300px 且不是一片空白', () => {
    render(<ScriptEditor script={script} />);

    const box = screen.getByTestId('loading-block');
    expect(box).toHaveStyle({ height: '300px' });
    expect(box.textContent).toContain(
      'components.markdown_editor.loading_editor',
    );
  });
});

/**
 * `handleCreateSubmit` 里的 `router.push` 一被**调用**，await 就结束了，
 * 导航还在飞。旧代码在 `finally` 里把 loading 关掉，按钮当场恢复成可点，
 * 而编程式跳转又没有全局顶部进度条（`NavigationProgress` 只监听 `<a>` 点击），
 * 于是用户看到的是一个「已经提交完但什么也没发生」的表单，只会再点一次。
 */
describe('ScriptEditor 提交态', () => {
  async function submit(onSubmit: () => Promise<void>) {
    render(<ScriptEditor script={script} onSubmit={onSubmit} />);
    const button = screen.getByRole('button', {
      name: /description_section.update_button/,
    });
    await act(async () => {
      fireEvent.click(button);
    });
    return button;
  }

  it('提交成功后按钮保持 loading，等待跳转完成', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const button = await submit(onSubmit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(button.className).toContain('ant-btn-loading');
  });

  it('提交失败后按钮恢复可点，用户可以改完再试', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'));
    const button = await submit(onSubmit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await waitFor(() =>
      expect(button.className).not.toContain('ant-btn-loading'),
    );
  });
});
