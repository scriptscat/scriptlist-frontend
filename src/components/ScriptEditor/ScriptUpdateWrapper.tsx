'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import ScriptEditor from './index';
import { ScriptInfo } from '@/app/[locale]/script-show-page/[id]/types';
import { scriptService } from '@/lib/api/services/scripts';

interface ScriptUpdateWrapperProps {
  script: ScriptInfo;
  scriptId: string;
}

export default function ScriptUpdateWrapper({
  script,
  scriptId,
}: ScriptUpdateWrapperProps) {
  const router = useRouter();

  const handleUpdateSubmit = async (formData: any) => {
    try {
      // 准备API数据，对应后端 UpdateCodeRequest 结构
      const apiData = {
        version: formData.version || '1.0.0', // 库的版本号 (required)
        tags: formData.tags || [], // 标签
        content: formData.detailedDescription || '', // 脚本详细描述 (required)
        code: formData.code || '', // 脚本代码 (required)
        definition: '', // 库的定义文件 (暂时为空)
        changelog: formData.changelog || '', // 更新日志
        is_pre_release: formData.isPreRelease || 0, // 是否预发布：0, 1, 2
        category_id: formData.category_id || undefined, // 分类ID
      };

      console.log('Updating script with data:', apiData);

      // 调用脚本服务更新脚本代码
      await scriptService.updateCode(scriptId, apiData);

      // 更新成功后跳转到脚本详情页
      router.push(`/script-show-page/${scriptId}`);
    } catch (error) {
      console.error('Update failed:', error);
      throw error; // 重新抛出错误让ScriptEditor组件处理
    }
  };

  return <ScriptEditor script={script} onSubmit={handleUpdateSubmit} />;
}
