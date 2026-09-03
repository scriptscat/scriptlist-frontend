/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import MonacoEditor from './index';
import MonacoDiffEditor from './DiffEditor';

/**
 * `@monaco-editor/react` 在编辑器就绪前渲染 `loading` 节点，
 * 不传时会落到库内硬编码的英文 "Loading..."（7 个语种都是英文）。
 * 这里把 `loading` 直接渲染出来断言它已被接管且已翻译。
 */
vi.mock('@monaco-editor/react', () => {
  const Editor = ({ loading }: { loading?: ReactNode }) => (
    <div data-testid="editor-loading">{loading}</div>
  );
  return {
    __esModule: true,
    default: Editor,
    Editor,
    DiffEditor: Editor,
    loader: { config: vi.fn() },
  };
});

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

vi.mock('@/contexts/ThemeClientContext', () => ({
  useTheme: () => ({ themeMode: { mode: 'light', theme: 'light' } }),
}));

afterEach(cleanup);

describe('MonacoEditor 加载态', () => {
  it('给 Editor 传入已翻译的加载占位', () => {
    const { getByTestId } = render(<MonacoEditor value="const a = 1;" />);
    const slot = getByTestId('editor-loading');

    expect(slot.textContent).toContain('components.loading.code');
    expect(slot.querySelector('.ant-spin')).not.toBeNull();
  });

  it('DiffEditor 同样接管加载态', () => {
    const { getByTestId } = render(
      <MonacoDiffEditor original="a" modified="b" />,
    );
    const slot = getByTestId('editor-loading');

    expect(slot.textContent).toContain('components.loading.code');
    expect(slot.querySelector('.ant-spin')).not.toBeNull();
  });
});
