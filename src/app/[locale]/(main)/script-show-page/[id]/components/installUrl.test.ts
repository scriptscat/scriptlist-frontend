import { describe, expect, it } from 'vitest';

import { SCRIPT_PUBLIC_PRIVATE, withInstallToken } from './installUrl';

describe('withInstallToken', () => {
  it('给没有查询串的安装链接追加 ?token=', () => {
    expect(withInstallToken('/scripts/code/1/a.user.js', 'sci_abc.def')).toBe(
      '/scripts/code/1/a.user.js?token=sci_abc.def',
    );
  });

  // 版本页的链接本来就带 ?version=，再用 ? 拼接会把整条链接拼坏。
  it('给已有查询串的安装链接用 & 追加', () => {
    expect(
      withInstallToken(
        '/scripts/code/1/a.user.js?version=1.0.0',
        'sci_abc.def',
      ),
    ).toBe('/scripts/code/1/a.user.js?version=1.0.0&token=sci_abc.def');
  });

  it('没有令牌时原样返回', () => {
    expect(withInstallToken('/scripts/code/1/a.user.js', undefined)).toBe(
      '/scripts/code/1/a.user.js',
    );
    expect(withInstallToken('/scripts/code/1/a.user.js', '')).toBe(
      '/scripts/code/1/a.user.js',
    );
  });

  it('对令牌做 URL 编码', () => {
    expect(withInstallToken('/x.user.js', 'a+b/c=')).toBe(
      '/x.user.js?token=a%2Bb%2Fc%3D',
    );
  });

  it('私有脚本的取值是 3', () => {
    expect(SCRIPT_PUBLIC_PRIVATE).toBe(3);
  });
});
