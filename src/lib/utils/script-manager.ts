/**
 * 脚本管理器相关工具函数
 */

export interface ScriptManagerAPI {
  isInstalled: (
    name: string,
    namespace: string,
    callback: (res: { installed: boolean; version: string }) => void,
  ) => void;
}

export interface ScriptInstallStatus {
  installed: boolean;
  version?: string;
}

/**
 * 检测脚本管理器是否可用
 * @returns 脚本管理器 API 对象，如果不可用则返回 null
 */
export function getScriptManagerAPI(): ScriptManagerAPI | null {
  if (typeof window === 'undefined' || !window.external) {
    return null;
  }

  const external = window.external as any;
  const api = external.Scriptcat || external.Tampermonkey;

  if (api && typeof api.isInstalled === 'function') {
    return api as ScriptManagerAPI;
  }

  return null;
}

/**
 * 检查脚本是否已安装
 * @param name 脚本名称
 * @param namespace 脚本命名空间
 * @returns Promise，返回安装状态
 */
export function checkScriptInstalled(
  name: string,
  namespace: string = '',
): Promise<ScriptInstallStatus> {
  return new Promise((resolve, reject) => {
    const api = getScriptManagerAPI();

    if (!api) {
      // 如果没有检测到脚本管理器，返回未安装状态
      resolve({ installed: false });
      return;
    }

    try {
      api.isInstalled(name, namespace, (res) => {
        resolve({
          installed: res.installed || false,
          version: res.version,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 检测是否有脚本管理器可用
 * @returns 是否有可用的脚本管理器
 */
export function hasScriptManager(): boolean {
  return getScriptManagerAPI() !== null;
}

/**
 * 获取脚本管理器类型
 * @returns 脚本管理器类型字符串或 null
 */
export function getScriptManagerType(): 'Scriptcat' | 'Tampermonkey' | null {
  if (typeof window === 'undefined' || !window.external) {
    return null;
  }

  const external = window.external as any;

  if (external.Scriptcat) {
    return 'Scriptcat';
  }

  if (external.Tampermonkey) {
    return 'Tampermonkey';
  }

  return null;
}
