'use client';

import { Card, Empty } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';

export default function LogsPage() {
  return (
    <Card className="shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            管理日志
          </Title>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-16">
        <ToolOutlined className="text-6xl text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">功能建设中</h3>
        <p className="text-gray-500 text-center max-w-md">
          日志管理功能正在开发中，敬请期待。
        </p>
      </div>
    </Card>
  );
}
