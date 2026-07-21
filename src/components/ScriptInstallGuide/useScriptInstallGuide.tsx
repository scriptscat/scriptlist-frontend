'use client';

import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { hasScriptManager } from '@/lib/utils/script-manager';
import ScriptManagerGuideModal from './ScriptManagerGuideModal';

interface UseScriptInstallGuideOptions {
  /** 覆盖弹窗默认说明文案（如订阅场景） */
  description?: string;
  /** 覆盖「仍要继续安装」文案（如订阅场景的「仍要继续订阅」） */
  proceedLabel?: string;
}

/**
 * 脚本安装 / 订阅引导 Hook。
 *
 * 用法：在按钮上绑定 `onClick={(e) => handleInstallClick(e, url)}`（安装按钮可同时保留
 * `href` + `target="_blank"` 以支持右键复制链接），并在组件中渲染一次 `guideModal`。
 *
 * - 已检测到脚本管理器（脚本猫 / Tampermonkey）：直接以新窗口打开链接照常安装 / 订阅。
 * - 完全未检测到脚本管理器：阻止跳转并弹出引导用户安装脚本猫的弹窗。
 *
 * 始终 `preventDefault` 并以 `window.open` 打开，故对 `<a>` 与纯 `<Button>` 调用方均通用，
 * 且所有链接统一以新窗口打开。
 */
export function useScriptInstallGuide(options?: UseScriptInstallGuideOptions) {
  const [open, setOpen] = useState(false);
  const [installUrl, setInstallUrl] = useState('');

  const handleInstallClick = useCallback(
    (e: MouseEvent<HTMLElement>, url: string) => {
      e.preventDefault();
      if (hasScriptManager()) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      setInstallUrl(url);
      setOpen(true);
    },
    [],
  );

  const guideModal = (
    <ScriptManagerGuideModal
      open={open}
      installUrl={installUrl}
      onClose={() => setOpen(false)}
      description={options?.description}
      proceedLabel={options?.proceedLabel}
    />
  );

  return { handleInstallClick, guideModal };
}
