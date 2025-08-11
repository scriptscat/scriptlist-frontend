import { useState } from 'react';
import { message } from 'antd';
import { scriptService } from '../services/scripts/scripts';
import { WatchLevel } from '@/app/[locale]/script-show-page/[id]/types';

/**
 * 脚本关注功能Hook
 */
export function useScriptWatch(
  scriptId: number,
  initialWatchLevel: WatchLevel = WatchLevel.NONE,
) {
  const [watchLevel, setWatchLevel] = useState<WatchLevel>(initialWatchLevel);
  const [loading, setLoading] = useState(false);

  const updateWatch = async (newWatchLevel: WatchLevel) => {
    if (loading) return;

    setLoading(true);
    try {
      await scriptService.watchScript(scriptId, newWatchLevel);
      setWatchLevel(newWatchLevel);

      const watchLabels = {
        [WatchLevel.NONE]: '不关注',
        [WatchLevel.VERSION]: '版本更新',
        [WatchLevel.FEEDBACK]: '新建反馈',
        [WatchLevel.ALL]: '任何动态',
      };

      message.success(`已设置关注类型：${watchLabels[newWatchLevel]}`);
    } catch (error) {
      message.error('设置关注状态失败，请重试');
      console.error('Failed to update watch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatch = async () => {
    const newLevel =
      watchLevel === WatchLevel.NONE ? WatchLevel.VERSION : WatchLevel.NONE;
    await updateWatch(newLevel);
  };

  const isWatched = watchLevel !== WatchLevel.NONE;

  return {
    watchLevel,
    isWatched,
    loading,
    updateWatch,
    toggleWatch,
  };
}
