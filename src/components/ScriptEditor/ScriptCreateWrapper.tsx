'use client';

import React from 'react';
import { message } from 'antd';
import { useRouter } from '@/i18n/routing';
import ScriptEditor from '@/components/ScriptEditor';
import { scriptService } from '@/lib/api/services/scripts';

export default function ScriptCreateWrapper() {
  const router = useRouter();

  const handleCreateSubmit = async (formData: any) => {
    try {
      // 准备API数据，对应后端 CreateRequest 结构
      const apiData = {
        content: formData.detailedDescription || '', // 脚本详细描述 (required)
        code: formData.code || '', // 脚本代码 (required)
        name: formData.libraryName || '', // 库的名字 (仅库类型需要)
        description: formData.libraryDescription || '', // 库的描述 (仅库类型需要)
        definition: '', // 库的定义文件 (暂时为空)
        version: formData.version || '1.0.0', // 库的版本
        tags: formData.tags || [], // 标签
        category_id: formData.category_id || undefined, // 分类ID
        type: parseInt(formData.type) || 1, // 脚本类型：1 用户脚本 2 脚本引用库 3 订阅脚本
        public: 1, // 公开类型：1 公开 2 半公开 3 私有 (默认公开)
        unwell: 2, // 不适内容: 1 不适 2 适用 (默认适用)
        changelog: formData.changelog || '', // 更新日志
      };

      console.log('Creating script with data:', apiData);

      // 调用脚本服务创建脚本
      const result = await scriptService.create(apiData);

      // 创建成功后跳转到脚本详情页
      router.push(`/script-show-page/${result.id}`);
    } catch (error) {
      console.error('Create failed:', error);
      throw error; // 重新抛出错误让ScriptEditor组件处理
    }
  };

  return <ScriptEditor onSubmit={handleCreateSubmit} />;
}
