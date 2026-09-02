/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Breadcrumb from 'antd/es/breadcrumb';
import Result from 'antd/es/result';
import Spin from 'antd/es/spin';
import { Col, Row } from 'antd/es/grid';

/**
 * 服务端组件必须以深层路径引入 antd，否则整个 barrel 会变成客户端引用
 * （原因与影响见 `antd-server-imports.test.ts`）。
 *
 * 深层路径的风险在于「静默失效」：antd 调整目录结构或默认导出后，
 * 导入拿到的可能是 undefined 或非组件对象，页面直接渲染不出东西，而类型检查未必拦得住。
 * 这里逐个渲染，断言产出的仍是 antd 约定的类名。
 */
describe('antd 深层导入', () => {
  beforeAll(() => {
    // Grid 的 useBreakpoint 会订阅 matchMedia，jsdom 未实现它。
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
  });

  it('antd/es/grid 的 Row / Col 渲染出 antd 类名', () => {
    const { container } = render(
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <span>main</span>
        </Col>
      </Row>,
    );

    expect(container.querySelector('.ant-row')).not.toBeNull();
    expect(container.querySelector('.ant-col')).not.toBeNull();
  });

  it('antd/es/breadcrumb 渲染出 antd 类名', () => {
    const { container } = render(
      <Breadcrumb items={[{ title: 'home' }, { title: 'script' }]} />,
    );

    expect(container.querySelector('.ant-breadcrumb')).not.toBeNull();
  });

  it('antd/es/result 渲染出 antd 类名', () => {
    const { container } = render(<Result status="403" title="403" />);

    expect(container.querySelector('.ant-result')).not.toBeNull();
  });

  it('antd/es/spin 渲染出 antd 类名', () => {
    const { container } = render(<Spin size="large" />);

    expect(container.querySelector('.ant-spin')).not.toBeNull();
  });
});
