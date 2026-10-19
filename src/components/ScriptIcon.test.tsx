/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ScriptIcon from './ScriptIcon';
import { ScriptUtils } from '@/app/[locale]/(main)/script-show-page/[id]/utils';

const script = {
  id: 42,
  updatetime: 1700000000,
  script: {
    meta_json: {
      name: ['demo'],
      description: [''],
      icon: ['https://example.com/icon.png'],
    },
  },
};

describe('Script icon thumbnail URLs', () => {
  it('maps rendered sizes to the fixed 64/128 thumbnail presets', () => {
    expect(ScriptUtils.icon(script, 24)).toBe(
      '/api/v2/scripts/42/icon/thumb/64?t=1700000000',
    );
    expect(ScriptUtils.icon(script, 64)).toBe(
      '/api/v2/scripts/42/icon/thumb/64?t=1700000000',
    );
    expect(ScriptUtils.icon(script, 96)).toBe(
      '/api/v2/scripts/42/icon/thumb/128?t=1700000000',
    );
    expect(ScriptUtils.icon(script, 128)).toBe(
      '/api/v2/scripts/42/icon/thumb/128?t=1700000000',
    );
  });

  it('tries the original proxy after a thumbnail 404, then uses the existing fallback', () => {
    render(<ScriptIcon script={script} name="Demo" size={64} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute(
      'src',
      '/api/v2/scripts/42/icon/thumb/64?t=1700000000',
    );

    fireEvent.error(image);
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/v2/scripts/42/icon?t=1700000000',
    );

    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
/**
 * 水合竞态：SSR 渲染的 <img> 常在水合完成前就已加载失败（后端对 SVG/WebP
 * 返回 404，响应只有几百字节，比 hydration 快）。那次 error 事件没有任何
 * 监听者，等 React 挂上 onError 时早过去了 —— complete=true、
 * naturalWidth=0，src 却停在缩略图上，用户看到裂图而不是兜底。
 * 线上 711、4107 的 SVG 图标就是这条路径。
 */
describe('Script icon hydration race', () => {
  const originals = {
    complete: Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'complete',
    ),
    naturalWidth: Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'naturalWidth',
    ),
  };

  /**
   * 按 URL 决定这张图是否"已完成且失败"，贴近真实浏览器：
   * 缩略图接口对 SVG 返回 404（坏），原图接口返回 SVG 正常渲染（好）。
   */
  function stubImageHealth(isBroken: (src: string) => boolean) {
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      configurable: true,
      get(this: HTMLImageElement) {
        return isBroken(this.getAttribute('src') ?? '') ? 0 : 64;
      },
    });
  }

  afterEach(() => {
    cleanup();
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) {
        Object.defineProperty(HTMLImageElement.prototype, key, descriptor);
      }
    }
  });

  it('advances past a thumbnail that failed before hydration', () => {
    // 只有缩略图失败，原图正常 —— 这正是 711/4107 的情况。
    stubImageHealth((src) => src.includes('/icon/thumb/'));

    render(<ScriptIcon script={script} name="Demo" size={64} />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/v2/scripts/42/icon?t=1700000000',
    );
  });

  it('leaves a healthy thumbnail alone', () => {
    stubImageHealth(() => false);

    render(<ScriptIcon script={script} name="Demo" size={64} />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/v2/scripts/42/icon/thumb/64?t=1700000000',
    );
  });

  it('reaches the letter fallback when both hops failed before hydration', () => {
    stubImageHealth(() => true);

    render(<ScriptIcon script={script} name="Demo" size={64} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
