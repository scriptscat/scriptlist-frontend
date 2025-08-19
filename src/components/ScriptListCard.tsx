'use client';

import { Card, List, Avatar, Tag, Typography, Space } from 'antd';
import { Link } from '@/i18n/routing';
import { ScriptUtils } from '@/app/[locale]/script-show-page/[id]/utils';
import { hashColor } from '@/lib/utils/utils';
import type { ReactNode } from 'react';
import type { ScriptListItem } from '@/app/[locale]/script-show-page/[id]/types';

const { Text } = Typography;

interface ScriptListCardProps {
  title: ReactNode;
  data: ScriptListItem[];
  maxItems?: number;
  icon?: ReactNode;
  className?: string;
}

export default function ScriptListCard({
  title,
  data,
  icon,
  className = '',
}: ScriptListCardProps) {
  return (
    <Card
      title={
        <Space>
          {icon}
          <Text strong>{title}</Text>
        </Space>
      }
      className={`border-0 shadow-sm rounded-xl bg-white dark:bg-gray-800 ${className}`}
      bodyStyle={{ padding: '8px 12px' }}
    >
      <List
        dataSource={data}
        renderItem={(item, index) => {
          const scriptIcon = item.script?.meta_json
            ? ScriptUtils.icon(item.script.meta_json)
            : null;
          const itemTitle = item.name;
          const itemId = item.id;

          return (
            <List.Item className="!px-0 !py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 overflow-hidden">
              <Link href={`/script-show-page/${itemId}`}>
                <div className="flex items-center gap-3 w-full px-2">
                  {scriptIcon ? (
                    <Avatar size={24} src={scriptIcon} shape="square" />
                  ) : (
                    <Tag
                      className="!m-0"
                      color={hashColor((index + 1).toString())}
                      style={index === 9 ? { padding: '0 3px' } : {}}
                    >
                      {index + 1}
                    </Tag>
                  )}
                  <div className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block">
                      {itemTitle}
                    </Text>
                  </div>
                </div>
              </Link>
            </List.Item>
          );
        }}
      />
    </Card>
  );
}
