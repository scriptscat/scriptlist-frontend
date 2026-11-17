import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkScriptInstalled } from './script-manager';

type IsInstalled = (
  name: string,
  namespace: string,
  callback: (res: unknown) => void,
) => void;

const stubManager = (isInstalled: IsInstalled) => {
  vi.stubGlobal('window', { external: { Scriptcat: { isInstalled } } });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('checkScriptInstalled', () => {
  it('reports the installed version from the script manager', async () => {
    stubManager((_n, _ns, cb) => cb({ installed: true, version: '1.2.0' }));
    await expect(checkScriptInstalled('demo', 'ns')).resolves.toEqual({
      installed: true,
      version: '1.2.0',
    });
  });

  // 线上上报：有的脚本管理器在脚本未安装时回调不带任何参数，
  // 直接读 res.installed 会抛 TypeError。
  it.each([undefined, null])(
    'treats a callback without a result (%s) as not installed',
    async (result) => {
      stubManager((_n, _ns, cb) => cb(result));
      await expect(checkScriptInstalled('demo', 'ns')).resolves.toEqual({
        installed: false,
        version: undefined,
      });
    },
  );

  it('is not installed when there is no script manager', async () => {
    vi.stubGlobal('window', {});
    await expect(checkScriptInstalled('demo')).resolves.toEqual({
      installed: false,
    });
  });
});
